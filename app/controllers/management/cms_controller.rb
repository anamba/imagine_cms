class Management::CmsController < Management::ApplicationController # :nodoc:
  include ActionController::Caching::Pages
  self.page_cache_directory = "#{Rails.root}/public"
  
  before_action :check_permissions
  before_action :block_basic_users, :except => [
    :index, :edit_page_content,
    :disable_caching, :garbage_collect,
    :select_page, :list_pages_select, :request_review,
    :toolbar_preview, :toolbar_edit,
    
    :create_file_link, :upload_file, :receive_file,
    
    :upload_image, :receive_image, :crop_image, :save_crop, :upload_status,
    :upload_thumb, :crop_thumb, :save_crop_thumb,
    :upload_feature_image, :crop_feature_image, :save_crop_feature_image,
    
    :receive_gallery, :complete_gallery, :gallery_setup, :add_to_gallery,
    :gallery_management, :select_gallery, :set_gallery_order, :save_gallery_settings,
    :sort_images, :sort_images_save,
    :image_details, :update_caption,
    :delete_photo, :delete_gallery,
    
    :pages, :list_pages, :edit_page, :show_template_options, :page_attribute, :set_page_version
  ]
  
  before_action :convert_invalid_chars_in_params
  
  upload_status_for :receive_image
  upload_status_for :add_to_gallery
  
  cache_sweeper :cms_content_sweeper
  
  def check_permissions
    if !user_has_permission?(:manage_cms)
      render '/imagine_cms/errors/permission_denied', :layout => false
      return false
    end
  end
  
  def block_basic_users
    return true unless UseCmsAccessLevels
    unless user_has_permission?(:manage_cms_full_access) && @user.cms_allowed_sections.to_s.strip.blank?
      render '/imagine_cms/errors/permission_denied'
      return false
    end
  end
  
  def validate_user_access
    unless @user.cms_allowed_sections.to_s.strip.blank?
      allowed_sections = @user.cms_allowed_sections.split(',').map { |s| s.strip }.reject { |s| s.blank? }
      if @pg
        path = '/' + @pg.path
      else
        parent = CmsPage.find_by_id(params[:parent_id] || params[:pg][:parent_id]) rescue nil
        return false if !parent
        path = '/' + parent.path
      end
      
      allowed = false
      allowed_sections.each { |s| allowed ||= (path =~ /^#{s}/) }
      
      if !allowed
        respond_to do |wants|
          wants.js    { render :text => "Sorry, you don't have permission to edit this page."         }
          wants.html  { redirect_to "/#{@pg.path}#{@pg.path == '' ? '' : '/'}version/#{@pg.version}"  }
        end
        return false
      end
    end
    
    true
  end
  
  
  def index
  end
  
  def templates
    @temps = CmsTemplate.order(:name)
  end
  
  def edit_template
    @temp = CmsTemplate.find_by_id(params[:id]) || CmsTemplate.new
    
    if request.post?
      @temp.assign_attributes(cms_template_params)
      
      # begin
        @pg = CmsPage.new
        @page_objects = OpenStruct.new
        render_to_string :inline => @temp.content
      # rescue StandardError => e
      #   message = e.message
      #   flash.now[:error] = "<pre>#{ERB::Util.html_escape(message)}</pre>".html_safe
      #   logger.debug e
      #   return
      # end
      
      # this must come after the render_to_string so that we capture template
      # options embedded in snippets
      @temp.options = @template_options
      
      if !@temp.save
        flash.now[:error] = @temp.errors.full_messages.join('<br/>')
      else
        flash[:notice] = 'Template saved.'
        redirect_to :action => 'edit_template', :id => @temp.id and return
      end
    end
  end
  
  def snippets
    @snippets = CmsSnippet.order(:name)
  end
  
  def edit_snippet
    @snip = CmsSnippet.find_by_id(params[:id]) || CmsSnippet.new
    
    if request.post?
      @snip.assign_attributes(cms_snippet_params)
      
      begin
        @pg = CmsPage.new
        @page_objects = OpenStruct.new
        render_to_string :inline => @snip.content
      rescue StandardError => e
        message = e.message
        flash.now[:error] = "<pre>#{ERB::Util.html_escape(message)}</pre>".html_safe
        logger.debug e
        return
      end
      
      if !@snip.save
        @error = @snip.errors.full_messages.join('<br/>')
      else
        flash[:notice] = 'Snippet saved.'
        redirect_to :action => 'edit_snippet', :id => @snip.id and return
      end
    end
  end
  
  def pages
    @page_levels = [ '' ].concat((params[:path] || session[:cms_pages_path] || '').split('/').reject { |l| l.blank? })
    @page_levels << ''
    @path = ''
    @page = nil
  end
  
  def list_pages
    @page_level = params[:level].to_i
    @parent = CmsPage.find_by_id(params[:parent_id])
    
    if @page_level == 0
      render :partial => 'list_page', :locals => { :list_page => CmsPage.find(1) } and return
    else
      if @parent
        @pages = @parent.children
        session[:cms_pages_path] = @parent.path
      else
        @pages = nil
      end
    end
    
    render :partial => 'list_pages'
  end
  
  def edit_page
    @pg = CmsPage.find_by_id(params[:id])
    validate_user_access or return
    @pg ||= CmsPage.new
    
    @parent = @pg.parent || CmsPage.find_by_id(params[:parent_id])
    if @parent
      @pg.parent ||= @parent
      @pg.template ||= @parent.template
    end
    
    @attrs = CmsPageObject.where(obj_type: 'attribute').pluck(:name).uniq.sort
    @taglist = CmsPageTag.pluck(:name).uniq.sort
    
    if params[:mode] == 'ajax_new' || params[:mode] == 'ajax_edit'
      @pg.published_version = -1 if params[:mode] == 'ajax_new'
      load_page_objects
      load_template_options
      render :partial => 'edit_page' and return
    end
    
    if request.post?
      params[:pg] ||= {}
      
      if params[:pg][:article_date_year]
        params[:pg][:article_date] = Time.zone.parse("#{params[:pg].delete(:article_date_year)}-#{params[:pg].delete(:article_date_month)}-#{params[:pg].delete(:article_date_day)}")
      end
      if params[:pg][:article_end_date_year]
        params[:pg][:article_end_date] = Time.zone.parse("#{params[:pg].delete(:article_end_date_year)}-#{params[:pg].delete(:article_end_date_month)}-#{params[:pg].delete(:article_end_date_day)}")
      end
      if params[:pg][:published_date_year]
        params[:pg][:published_date] = Time.zone.parse("#{params[:pg].delete(:published_date_year)}-#{params[:pg].delete(:published_date_month)}-#{params[:pg].delete(:published_date_day)}")
      end
      if params[:pg][:expires]
        date = Time.zone.parse("#{params[:pg].delete(:expiration_date_year)}-#{params[:pg].delete(:expiration_date_month)}-#{params[:pg].delete(:expiration_date_day)}")
        params[:pg][:expiration_date] = date if params[:pg][:expires] == 'true'
      end
      
      @pg.assign_attributes(cms_page_params)
      unless params[:use_article_date_range].to_i > 0
        @pg.article_end_date = nil
      end
      @pg.updated_by ||= session[:user_id]
      @pg.updated_by_username ||= session[:user_username]
      @pg.published_version = 0 if @pg.respond_to?(:redirect_enabled) && @pg.redirect_enabled
      
      if @pg.send(@pg.new_record? ? :save : :save_without_revision)
        # now try to save tags
        existing_tags = @pg.tags.map(&:name)
        tags_to_delete = [] ; @pg.tags.each { |t| tags_to_delete << t }
        params[:tags].split(',').map(&:strip).reject(&:blank?).each do |t|
          if existing_tags.include?(t)
            # still in use, don't delete
            tags_to_delete = tags_to_delete.reject { |tag| tag.name == t }
          else
            # doesn't exist, create
            @pg.tags.create(name: t)
          end
        end
        tags_to_delete.each { |t| t.destroy }
        
        # now try to save page objects (just attributes in this case)
        objects_to_delete = @pg.objects.where("obj_type = 'attribute' or obj_type = 'option'").all
        
        (params[:page_objects] || {}).each do |key,val|
          next if val.blank?
          
          if key =~ /^obj-(\w+?)-(.+?)$/
            obj = @pg.objects.where(:name => $2, :obj_type => $1).first
            obj ||= @pg.objects.build(:name => $2, :obj_type => $1)
            obj.content = val
            obj.save
            objects_to_delete = objects_to_delete.reject { |obj| obj.name == $2 }
          end
        end
        
        objects_to_delete.each { |t| t.destroy }
        
        case params[:return_to]
        when 'preview'
          render :update do |page|
            page.redirect_to "#{@pg.path.blank? ? '' : '/' + @pg.path}/version/#{@pg.published_version > 0 ? @pg.published_version : @pg.version}"
          end
        else
          flash[:notice] = 'Page saved.'
          session[:cms_pages_path] = @pg.path
          render :update do |page|
            page.redirect_to :action => 'pages'
          end
        end
        
      else
        # save failed, display errors
        logger.error "Save failed: #{CmsPage.without_revision { @pg.save }} #{@pg.errors.full_messages.join('; ')}"
        render :update do |page|
          page.replace_html 'save_errors', @pg.errors.full_messages.join('<br>')
          page << "try { $('btn_next').disabled = false; } catch (e) {}"
          page << "try { $('btn_finish').disabled = false; } catch (e) {}"
          page << "try { $('btn_save').disabled = false; $('btn_save').value = 'Save'; } catch (e) {}"
        end and return
      end
    end
  end
  
  def delete_page
    @pg = CmsPage.find_by_id(params[:id])
    
    if !@pg
      flash[:error] = "Sorry, couldn't find the requested page."
    elsif @pg.children.size > 0
      flash[:error] = "This page contains other pages. Please delete those first if you are sure you want to delete this page."
    elsif @pg.id == 1
      flash[:error] = "You cannot delete the home page."
    else
      flash[:notice] = "Page deleted."
      session[:cms_pages_path] = @pg.parent.path rescue nil
      @pg.destroy
    end
    
    redirect_to :action => 'pages'
  end
  
  def select_page
    @page_levels = [ '' ].concat((params[:path].blank? ? session[:cms_pages_path] : params[:path]).to_s.split('/').reject { |l| l.blank? })
    @page_levels << ''
    @path = ''
    @page = nil
    
    render :layout => false
  end
  
  def list_pages_select
    @page_level = params[:level].to_i
    @parent = CmsPage.find_by_id(params[:parent_id])
    
    if @page_level == 0
      render :partial => 'list_page_select', :locals => { :list_page_select => CmsPage.find(1) } and return
    else
      if @parent
        @pages = @parent.children
        session[:cms_pages_path] = @parent.path
      else
        @pages = nil
      end
    end
    
    render :partial => 'list_pages_select'
  end
  
  def show_template_options
    @pg = CmsPage.find_by_id(params[:id]) || CmsPage.new
    @pg.cms_template_id = params[:template_id]
    
    load_page_objects
    load_template_options
    
    render :partial => 'template_options'
  end
  
  def page_attribute
    render :nothing => true and return unless params[:name]
    
    @page_objects = OpenStruct.new({ params[:name] => params[:value] })
    render :partial => 'page_attribute', :locals => { :name => params[:name] }
  end
  
  def edit_page_content
    @pg = CmsPage.find(params[:id])
    validate_user_access or return
    
    @page_objects = OpenStruct.new(params[:page_objects] || {})
    
    if request.get?
      @pg.version = params[:version] if params[:version] && params[:version].to_i != @pg.version
      @pg.objects.where(cms_page_version: @pg.version).each do |obj|
        key = "obj-#{obj.obj_type.to_s}-#{obj.name}"
        @page_objects[key] = obj.content.html_safe
      end
      
      # set "legacy" vars
      @content_levels = @pg.path.split('/')
      params[:section] = @content_levels.size < 1 ? '' : @content_levels.first
      params[:subsection] = @content_levels[1] unless @content_levels.size < 3
      if @content_levels.size == 1
        params[:page] = 'index'
      elsif @content_levels.size > 1
        params[:page] = @content_levels.last
      end
      
      @page_title = @pg.title
      
      @cms_head ||= ''
      @cms_head << "<script type=\"text/javascript\" src=\"#{url_for(action: 'page_tags_for_lookup')}\"></script>"
      
      @template_content = substitute_placeholders(@pg.template.content, @pg)
      render layout: 'application'
    
    elsif request.post?
      CmsPage.transaction do
        # need to revise this later if we implement deletion of page objects
        old_objs = @pg.objects.where(:cms_page_version => @pg.version).all
        
        @pg.updated_by = session[:user_id]
        @pg.updated_by_username = session[:user_username]
        
        # if basic user, make sure published version is not set to 'latest'
        if (UseCmsAccessLevels && !user_has_permission?(:manage_cms_full_access)) && @pg.published_version == 0
          @pg.published_version = @pg.version
        end
        
        @pg.updated_on = Time.now.utc
        @pg.save
        
        # do a little bit of classification... for now, just identify page lists
        page_lists = []
        @page_objects.each do |key,val|
          key =~ /^obj-(\w+?)-(\w+?)-sources-tag-count$/
          if $1 == 'page_list'
            page_lists << "obj-#{$1}-#{$2}"
          end
        end
        
        # run through page lists and do a little housekeeping
        page_lists.each do |key|
          # optimize source lists: tags
          if @page_objects["#{key}-sources-tag-count"].to_i > 0
            tags = []
            @page_objects["#{key}-sources-tag-count"].to_i.times do |i|
              logger.debug "Adding tag: #{@page_objects["#{key}-sources-tag#{i}"]}"
              tags << @page_objects["#{key}-sources-tag#{i}"]
            end
            tags.reject! { |tag| tag.blank? }
            @page_objects["#{key}-sources-tag-count"] = tags.size
            tags.each_with_index do |tag, i|
              @page_objects["#{key}-sources-tag#{i}"] = tag
            end
          end
          
          # optimize source lists: folders
          if @page_objects["#{key}-sources-folder-count"].to_i > 0
            folders = []
            @page_objects["#{key}-sources-folder-count"].to_i.times do |i|
              logger.debug "Adding folder: #{@page_objects["#{key}-sources-folder#{i}"]}"
              folders << @page_objects["#{key}-sources-folder#{i}"]
            end
            folders.reject! { |folder| folder.blank? }
            @page_objects["#{key}-sources-folder-count"] = folders.size
            folders.each_with_index do |folder, i|
              @page_objects["#{key}-sources-folder#{i}"] = folder
            end
          end
          
          # consolidate date picker fields
          if @page_objects["#{key}-date-range-custom-start_year"]
            @page_objects["#{key}-date-range-custom-start"] = 
              Time.utc(@page_objects.delete("#{key}-date-range-custom-start_year"),
                          @page_objects.delete("#{key}-date-range-custom-start_month"),
                          @page_objects.delete("#{key}-date-range-custom-start_day"))
          end
          if @page_objects["#{key}-date-range-custom-end_year"]
            @page_objects["#{key}-date-range-custom-end"] = 
              Time.utc(@page_objects.delete("#{key}-date-range-custom-end_year"),
                          @page_objects.delete("#{key}-date-range-custom-end_month"),
                          @page_objects.delete("#{key}-date-range-custom-end_day"))
          end
        end
        
        @page_objects.each do |key,val|
          key =~ /^obj-(\w+?)-(.+?)$/
          obj = @pg.objects.build(:name => $2, :obj_type => $1)
          
          # do a little bit of "censorship" to fix up Word pastes and strange things from the editor
          if val.is_a?(String)
            # all meta and link tags
            val.gsub!(/(<\/?)(meta|link)(.*?)>/m, '')
            
            # the dreaded MsoNormal
            val.gsub!(' class="MsoNormal"', '')
            
            # remove all font-family/font-size css styles, as well as font tags
            val.gsub!(/font-(?:family|size):.*?(;|")/, '\3')
            val.gsub!(/<font.*?>(.*?)<\/font>/, '\1')
            
            # strange conditional IE stuff
            val.gsub!(/<!--\[if(.*?)<!(--)?\[endif\]-->/m, '')
            
            # not even sure what these are supposed to be
            val.gsub!(/<xml>(.*?)<\/xml>/m, '')
            
            # images pointing to the local drive??
            val.gsub!(/<img src="file:(.*?)>/, '')
            
            # miscellany
            val.gsub!('<!--StartFragment-->', '')
            val.gsub!('<!--EndFragment-->', '')
            val.gsub!(/<span style="(?:;*)">(.*?)<\/span>/m, '\1')
            val.gsub!(' style="(?:;*)"', '')
            val.gsub!('<b></b>', '')
            
            # we could try to catch all strange ms tags...
            #val.gsub!(/(<\/?)(?:o|u1):p>/, '\1p>')
            #val.gsub!(/(<\/?)(?:st1):(.*?)>/, '')
            
            # but it's easier just remove all tags with colons in them
            val.gsub!(/(<\/?)[\w\d]+:[\w\d]+(.*?)>/, '')
            
            
            ### other non-ms word specific stuff ###
            
            # pirate styles not welcome
            val.gsub!(/<style(?:.*?)>(.*?)<\/style>/m, '')
            
            # fix strange <br>s from the editor
            val.gsub!(/<br>(<\/h\d>|<\/p>)/, '\1')
          end
          
          obj.content = val.to_s.force_encoding("UTF-8")
          obj.save
        end
        
        old_objs.each do |obj|
          unless @pg.objects.where(name: obj.name, cms_page_version: @pg.version)
            obj = @pg.objects.build(:name => obj.name, :obj_type => obj.type, :content => obj.content)
          end
        end
        
        # update index for searching
        @pg.update_index
        @pg.save_without_revision
      end
      
      redirect_to "/#{@pg.path}#{@pg.path == '' ? '' : '/'}version/#{@pg.version}"
    end
  end
  
  def insert_page_object_config
    @pg = CmsPage.find(params[:id])
    
    load_page_objects
    @pg.revert_to(params[:version]) if params[:version]
    @pg.objects.where(cms_page_version: @pg.version).each do |obj|
      key = "obj-#{obj.obj_type.to_s}-#{obj.name}"
      @page_objects[key] = obj.content
    end
    
    name = params[:name]
    render :nothing => true and return unless name
    
    parent_key = params[:parent_key]
    type = params[:type]
    render :nothing => true and return unless type == 'page_list'
    
    key = "obj-#{type}-#{name.gsub(/[^\w]/, '_')}"
    
    render :update do |page|
      page.insert_html :bottom, "page_object_config_#{parent_key}", :partial => 'page_list',
                                                                    :locals => { :name => name, :key => key }
    end
  end
  
  def page_tags_for_lookup
    @tags = CmsPageTag.order(:name).map { |tag| tag.name }.uniq
    headers['content-type'] = 'text/javascript'
    render :layout => false
  end
  
  def page_attributes_for_lookup
    @attrs = CmsPageObject.where(:obj_type => 'attribute').uniq.pluck(:name).sort
    headers['content-type'] = 'text/javascript'
    render :layout => false
  end
  
  def page_list_add_tag
    render :partial => 'page_list_source_tag', :locals => { :i => params[:i], :key => params[:key] }
  end
  
  def page_list_add_folder
    render :partial => 'page_list_source_folder', :locals => { :i => params[:i], :key => params[:key] }
  end
  
  def set_page_version
    if (UseCmsAccessLevels && user_has_permission?(:manage_cms_publishing) || user_has_permission?(:manage_cms_full_access)) || user_has_permission?(:manage_cms)
      if params[:id] && params[:pg]
        @pg = CmsPage.find(params[:id])
        validate_user_access or return
        @pg.published_version = params[:pg][:published_version]
        @pg.update_index
        @pg.save_without_revision
        logger.debug @pg.errors.full_messages.inspect
      end
    end
    
    render plain: 'success'
  end
  
  def request_review
    @pg = CmsPage.find(params[:id])
    @version = params[:version].to_i
    
    # send email to request administrative review
    emails = []
    
    User.find_each do |u|
      next unless u.active? && valid_email_address?(u.email_address)              # must be active and have valid email address
      next unless u.can_manage_cms_publishing? && u.cms_allowed_sections.blank?   # and have permission to publish
      emails << ImagineCmsMailer.request_review(url_for(controller: '/cms/content', action: 'show', content_path: @pg.path.split('/')), @pg.title, @version, u, @user, params[:change_description].to_s)
    end
    
    # email delivery could may fail, catch exceptions here
    emails.each do |email|
      begin
        email.deliver_now
      rescue StandardError => e
        logger.error(e)
      end
    end
    
    render nothing: true
  end
  
  #
  # helpers
  #
  
  def insert_object(name, type = :text, options = {}, html_options = {})
    extend ActionView::Helpers::FormHelper
    extend ActionView::Helpers::JavaScriptHelper
    extend ActionView::Helpers::PrototypeHelper
    extend ActionView::Helpers::TagHelper
    extend ActionView::Helpers::TextHelper
    
    key = "obj-#{type.to_s}-#{name.gsub(/[^\w]/, '_')}"
    @page_objects[key] ||= ''
    
    case type.to_sym
    when :string
      @page_objects[key] = options[:content] if @page_objects[key].blank?
      text_field(:page_objects, key, options)
    when :text
      @page_objects[key] = options[:content] if @page_objects[key].blank?
      focusOnLoad = !defined?(@cms_text_editor_placed)
      @cms_text_editor_placed = true
      content = ''.html_safe
      content << text_area(:page_objects, key, { :dojoType => 'Editor2', :toolbarGroup => 'main', :isToolbarGroupLeader => 'false',
                           :focusOnLoad => focusOnLoad.to_s, :style => 'border: 2px dashed gray; padding: 5px',
                           :minHeight => '100px' }.update(html_options))
      content << content_tag(:div, ''.html_safe, :id => "page_object_config_#{key}")
      content << javascript_tag("jQuery(document).ready(function () { scanForPageObjects(#{@pg.id}, '#{key}', #{@pg.version}); });")
      content << observe_field("page_objects_#{key}", :function => "scanForPageObjects(#{@pg.id}, '#{key}', #{@pg.version});", :frequency => 2)
      content
    when :page_list
      # set defaults unless values are present in template
      @page_objects["#{key}-min-item-count"] ||= 3 unless options[:item_min_count]
      @page_objects["#{key}-max-item-count"] ||= 5 unless options[:item_count]
      @page_objects["#{key}-sort-first-field"] ||= options[:primary_sort_key]
      @page_objects["#{key}-sort-first-direction"] ||= options[:primary_sort_direction]
      @page_objects["#{key}-sort-second-field"] ||= options[:secondary_sort_key]
      @page_objects["#{key}-sort-second-direction"] ||= options[:secondary_sort_direction]
      
      render_to_string(partial: 'page_list', locals: { name: name, key: key, options: options }).html_safe
    when :snippet
      @snippet = CmsSnippet.find_by_name(name)
      if @snippet
        erb_render(substitute_placeholders(@snippet.content, @pg))
      else
        'Could not find snippet "' + name + '" in the database.'
      end
    else
      "Unknown object type: #{type.to_s}"
    end
  end
  helper_method :insert_object
  
  # shortcuts
  def text_editor(name, options = {}, html_options = {})
    insert_object(name, :text, options, html_options)
  end
  alias :texteditor :text_editor
  helper_method :text_editor, :texteditor
  
  def page_list(name, options = {}, html_options = {})
    insert_object(name, :page_list, options, html_options)
  end
  alias :pagelist :page_list
  helper_method :page_list, :pagelist
  
  def snippet(name, options = {}, html_options = {})
    insert_object(name, :snippet, options, html_options)
  end
  helper_method :snippet
  
  
  def disable_caching ; end
  helper_method :disable_caching
  
  #
  # cms toolbars
  #
  
  def toolbar_edit
    @pg = CmsPage.find_by_id(params[:id])
    render :layout => false
  end
  
  def toolbar_preview
    @pg = CmsPage.find_by_id(params[:id])
    render :layout => false
  end
  
  #
  # image upload
  #
  
  def upload_image
    @pg = CmsPage.find_by_id(params[:id])
    target_dir = File.join(Rails.root, 'public', 'assets', 'content', @pg.path)
    
    if File.exist?(target_dir)
      redirect_to :action => 'select_gallery', :id => @pg, :gallery_id => params[:gallery_id]
    else
      render :partial => 'upload_image'
    end
  end
  
  def receive_image
    @pg = CmsPage.find_by_id(params[:id])
    
    target_dir = File.join(Rails.root, 'public', 'assets', 'content', @pg.path)
    FileUtils.mkdir_p target_dir
    
    data = params[:file][:data]
    original_filename = data.original_filename.strip.gsub(/[\?\s\/\:\\]+/, '-').gsub(/^-/, '').gsub(/-$/, '')
    localfile = File.join(target_dir, original_filename)
    
    im = MiniMagick::Image.open(data.path())
    if im['dimensions'][0] > CmsImageMaxWidth || im['dimensions'][1] > CmsImageMaxHeight
      im.resize "#{CmsImageMaxWidth}x#{CmsImageMaxHeight}"
      im.write(localfile)
    else
      FileUtils.cp(data.path(), localfile)
    end
    
    finish_upload_status "'#{File.basename(localfile)}'"
  end
  
  def crop_image
    @pg = CmsPage.find_by_id(params[:id])
    localfile = File.join(Rails.root, 'public', 'assets', 'content', @pg.path, File.basename(params[:filename]))
    File.chmod(0644, localfile)
    
    # get out now if user clicked finish
    if params[:next_clicked].to_i != 1
      @image_file = localfile + "?#{File.mtime(localfile).to_i}"
      upload_to_s3(localfile, @pg)
      
      render :partial => 'crop_results' and return
    end
    
    
    # if we're still here... let's crop!
    target_dir = File.join(Rails.root, 'public', 'assets', 'content', @pg.path)
    testfile = File.join(target_dir, File.basename(localfile, File.extname(localfile))) + '-croptest' + File.extname(localfile)
    
    # make a smaller version to help with cropping
    im = MiniMagick::Image.open(localfile)
    im.resize "500x400>"
    im.write(testfile)
    File.chmod(0644, testfile)
    
    @width = im[:width]
    @height = im[:height]
    @height = 1 if @height == 0
    @image_file = File.basename(testfile)
    @aspect_ratio = @width.to_f/@height
    
    render :partial => 'crop_image'
  end
  
  def save_crop
    @pg = CmsPage.find_by_id(params[:id])
    target_dir = File.join(Rails.root, 'public', 'assets', 'content', @pg.path)
    testfile = File.join(target_dir, File.basename(params[:filename]))
    localfile = testfile.split(/-croptest/).join('')
    
    # need to scale up requested position/dimensions based on how big test image
    # is relative to original image
    orig_im = MiniMagick::Image.from_file(localfile)
    test_im = MiniMagick::Image.from_file(testfile)
    scale = orig_im[:width].to_f / test_im[:width]
    
    x1 = params[:image][:x1].to_i * scale
    y1 = params[:image][:y1].to_i * scale
    width = params[:image][:width].to_i * scale
    height = params[:image][:height].to_i * scale
    
    max_width = params[:image][:max_width].to_i
    max_height = params[:image][:max_height].to_i
    dirty = false
    
    # crop if user selected something
    if params[:image][:width].to_i > 0
      logger.debug "cropping @ (#{x1}, #{y1}) to size #{width} x #{height}"
      orig_im.crop "#{width}x#{height}+#{x1}+#{y1}"
      dirty = true
    end
    
    # resize if the resultant image is bigger than max dims
    if max_width > 0 && max_height > 0
      if orig_im[:width] > max_width || orig_im[:height] > max_height
        logger.debug "resizing to max dims #{max_width} x #{max_height}"
        orig_im.resize "#{max_width}x#{max_height}"
        dirty = true
      end
    end
    
    orig_im.write(localfile) if dirty
    File.chmod(0644, localfile)
    
    @image_file = localfile + "?#{File.mtime(localfile).to_i}"
    File.unlink testfile
    upload_to_s3(localfile, @pg)
    
    render :partial => 'crop_results'
  end
  
  def receive_gallery
    @pg = CmsPage.find_by_id(params[:id])
    
    target_dir = File.join(Rails.root, 'public', 'assets', 'content', @pg.path)
    FileUtils.mkdir_p target_dir
    
    count = 1
    localdir = File.join(target_dir, 'gallery_1')
    while File.exist?(localdir) && count < 100
      count += 1
      localdir = File.join(target_dir, "gallery_#{count}")
    end
    FileUtils.mkdir_p File.join(localdir, 'temp')
    
    data = params[:gallery_file][:data]
    # read zip file
    
    entries = []
    Zip::File.foreach(data.path) do |zipentry|
      next if ![ '.jpg', '.jpeg', '.png', '.gif' ].include?(File.extname(zipentry.name).downcase) || zipentry.size < 1000
      next if File.basename(zipentry.name) =~ /^\._/
      
      entries << zipentry
    end
    entries.sort! { |a,b| File.basename(a.name).downcase <=> File.basename(b.name).downcase }
    
    Zip::File.open(data.path) do |zipfile|
      entries.each_with_index do |zipentry, index|
        upload_progress.message = "Extracting #{File.basename(zipentry.name)}"
        ext = File.extname(zipentry.name)
        localfile = File.join(localdir, 'temp', (index+1).to_s + ext.downcase)
        jpgfile = File.join(localdir, 'temp', (index+1).to_s + '.jpg')
        
        begin
          zipentry.extract(localfile)
          
          im = MiniMagick::Image.from_file(localfile)
          im.write(jpgfile)
          
          File.unlink(localfile) if localfile != jpgfile
          
        rescue StandardError => e
          logger.error(e)
        end
      end
    end
    
    finish_upload_status "'#{File.basename(localdir)}'"
  end
  
  def gallery_setup
    @pg = CmsPage.find_by_id(params[:id])
    target_dir = File.join('assets', 'content', @pg.path)
    @dirname = File.join(target_dir, File.basename(params[:dirname]), 'temp')
    Dir.chdir(File.join(Rails.root, 'public'))
    @images = Dir.glob("#{@dirname}/*.{jpg,jpeg,png,gif}").sort
    Dir.chdir(Rails.root)
    @thumbs = []
    
    @images.each do |img|
      next if img.include?('-thumb')
      
      thumbfile = File.join(Rails.root, 'public', @dirname, File.basename(img, File.extname(img))) + '-thumb.jpg'
      @thumbs << File.join(@dirname, File.basename(img, File.extname(img))) + '-thumb.jpg'
      
      next if File.exist?(thumbfile)
      
      im = MiniMagick::Image.from_file(File.join(Rails.root, 'public', img))
      im.resize "80x80" # hardcoded!
      im.write(thumbfile)
      File.chmod(0644, thumbfile)
    end
    
    @thumbs.sort! { |a,b| File.basename(a, File.extname(a)).to_i <=> File.basename(b, File.extname(b)).to_i }
    session[:gallery_thumbs_ordered] = @thumbs.map { |thumb| File.basename(thumb, File.extname(thumb)) }
    
    render :partial => 'gallery_setup'
  end
  
  
  def complete_gallery
    @pg = CmsPage.find(params[:id])
    target_dir = File.join('assets', 'content', @pg.path)
    @dirname = File.join(target_dir, File.basename(params[:dirname]))
    @thumbs = session[:gallery_thumbs_ordered]
    max_width = params[:max_width].to_i
    max_width = GalleryMaxWidth unless max_width > 0
    max_height = params[:max_height].to_i
    max_height = GalleryMaxHeight unless max_height > 0
    
    create_captions_file(@pg.id, { :gallery_id => File.basename(params[:dirname]) })
    
    @thumbs.each_with_index do |thumb, index|
      thumb.gsub!(/-thumb/, '')
      tempfile = File.join(Rails.root, 'public', @dirname, 'temp', thumb + '.jpg')
      tempthumbfile = File.join(Rails.root, 'public', @dirname, 'temp', thumb + '-thumb.jpg')
      
      localfile = File.join(Rails.root, 'public', @dirname, (index+1).to_s + '.jpg')
      thumbfile = File.join(Rails.root, 'public', @dirname, (index+1).to_s + '-thumb.jpg')
      
      im = MiniMagick::Image.from_file(tempfile)
      if im[:width] > max_width || im[:height] > max_height
        im.resize("#{max_width}x#{max_height}")
      end
      im.write(localfile)
      
      small = MiniMagick::Image.from_file(tempfile)
      small.crop_resized(GalleryThumbWidth, GalleryThumbHeight)
      small.write(thumbfile)
      
      File.chmod(0644, localfile, thumbfile)
      
      begin
        File.unlink(tempfile)
        File.unlink(tempthumbfile)
      rescue StandardError => e
        # not that big a deal if we can't delete
      end
    end
    
    begin
      Dir.rmdir(File.join(Rails.root, 'public', @dirname, 'temp'))
    rescue StandardError => e
      # not that big a deal if we can't delete
    end
    
    create_preview_images
    
    render :partial => 'complete_gallery'
  end

  def gallery_management
    @pg = CmsPage.find_by_id(params[:id])
    galleries_dir = File.join(Rails.root, 'public', 'assets', 'content', @pg.path)
    @galleries = Dir.glob("#{galleries_dir}/gallery_*")
    gallery_dir = File.join(galleries_dir, params[:gallery_id].to_s)
    
    @images = Dir.glob("#{gallery_dir}/*.{jpg,jpeg,png,gif}").reject { |img| img.include?('thumb') }.map { |img| File.basename(img).split('.').first.to_i }.sort
    
    create_preview_images
    
    if params[:gallery_id]
      @gallery = load_gallery_settings_from_file(params[:gallery_id])
    end
    
    render :layout => false
  end
  
  def set_gallery_order
    session[:gallery_thumbs_ordered] = params[:image_sorter]
    render :nothing => true
  end
  
  def select_gallery
    @pg = CmsPage.find_by_id(params[:id])
    @target_dir = File.join(Rails.root, 'public', 'assets', 'content', @pg.path)
    @galleries = Dir.glob("#{@target_dir}/gallery_*")
    
    create_preview_images
    
    if request.post?
      unless params[:gallery_id].downcase == "new"
        redirect_to :action => 'gallery_management', :id => @pg, :gallery_id => params[:gallery_id]
      else
        render :partial => 'upload_image'
      end
    else
      render :partial => 'select_gallery'
    end
  end
  
  def save_gallery_settings
    if request.post?
      @pg = CmsPage.find_by_id(params[:id])
      save_gallery_settings_to_file(params[:gallery_id], params[:gallery])
      
      render :nothing => true
    end
  end
  
  def sort_images
    @pg = CmsPage.find_by_id(params[:id])
    gallery_dir = File.join(Rails.root, 'public', 'assets', 'content', @pg.path, params[:gallery_id])
    
    @images = Dir.glob("#{gallery_dir}/*.{jpg,jpeg,png,gif}").reject { |img| img.include?('thumb') }.map { |img| File.basename(img).split('.').first.to_i }.sort
    
    if params[:images]
      session[:gallery_images_sorted] = params[:images]
      render :nothing => true
    else    
      render :partial => 'sort_images'
    end
  end
  
  def sort_images_save
    @pg = CmsPage.find_by_id(params[:id])
    gallery_dir = File.join(Rails.root, 'public', 'assets', 'content', @pg.path, params[:gallery_id])
    temp_dir = File.join(gallery_dir, 'temp')
    sorted_images = session[:gallery_images_sorted] || []
    
    if sorted_images == []
      redirect_to :action => 'gallery_management', :id => @pg, :gallery_id => params[:gallery_id]
      return
    end
    
    # create blank captions.yml if it doesn't already exist
    create_captions_file(@pg.id)
    
    original_captions = YAML.load_file(File.join(gallery_dir, 'captions.yml')).to_a
    new_captions = [ original_captions[0] ]
    
    Dir.glob("#{gallery_dir}/**/*.jpg").each { |img| FileUtils.touch(img); FileUtils.mv(img, img + '.tmp') }
    
    sorted_images.each_with_index do |img, i|
      FileUtils.mv(File.join(gallery_dir, "#{img.to_i}.jpg.tmp"), File.join(gallery_dir, "#{i+1}.jpg"))
      FileUtils.mv(File.join(gallery_dir, "#{img.to_i}-thumb.jpg.tmp"), File.join(gallery_dir, "#{i+1}-thumb.jpg"))
      FileUtils.mv(File.join(gallery_dir, 'management', "#{img.to_i}.jpg.tmp"), File.join(gallery_dir, 'management', "#{i+1}.jpg"))
      new_captions << original_captions[img.to_i] || ''
    end
    
    yaml = YAML.dump(new_captions)
    File.open(File.join(gallery_dir, 'captions.yml'), 'w') { |f| f << yaml }
    session[:gallery_images_sorted] = nil
    
    redirect_to :action => 'gallery_management', :id => @pg, :gallery_id => params[:gallery_id]
  end
  
  def image_details
    @pg = CmsPage.find_by_id(params[:id])
    
    # create blank captions.yml if it doesn't already exist
    create_captions_file(@pg.id)
    
    gallery_dir = File.join(Rails.root, 'public', 'assets', 'content', @pg.path, params[:gallery_id])
    captions = YAML.load(File.open(File.join(gallery_dir, 'captions.yml')).read)
    image_id = params[:image].split('.').first.to_i
    @caption = captions[image_id]
    
    render partial: 'image_details'
  end
  
  def update_caption
    if request.post?
      @pg = CmsPage.find_by_id(params[:id])
      
      # create blank captions.yml if it doesn't already exist
      create_captions_file(@pg.id)
      
      gallery_dir = File.join(Rails.root, 'public', 'assets', 'content', @pg.path, params[:gallery_id])
      captions = YAML.load_file(File.join(gallery_dir, 'captions.yml')).to_a
      image_id = params[:image].split('.').first.to_i
      captions[image_id] = params[:caption]
      
      yaml = YAML.dump(captions)
      File.open(File.join(gallery_dir, 'captions.yml'), "w") { |f| f << yaml }
    end
    
    redirect_to action: 'gallery_management', id: params[:id], gallery_id: params[:gallery_id]
  end
  
  def add_to_gallery
    @pg = CmsPage.find_by_id(params[:id])
    galleries_dir = File.join(Rails.root, 'public', 'assets', 'content', @pg.path)
    @galleries = Dir.entries(galleries_dir).sort
    @gallery_dir = File.join(galleries_dir, params[:gallery_id])    
    images = Dir.glob("#{@gallery_dir}/*-thumb.{jpg,jpeg,png,gif}")
    
    temp_location = File.join(@gallery_dir ,'temp')
    FileUtils.rm_rf(temp_location)
    Dir.mkdir(temp_location)
    
    data = params[:gallery_file][:data]
    data_dest = File.join(temp_location, data.original_filename)
    File.open(data_dest, 'wb') { |f| f.write(data.read) }
    
    last_id = images.size
    ext = File.extname(data_dest).downcase
    
    if ext != '.zip'
      localfile = File.join(@gallery_dir, (last_id + 1).to_s + ext)
      thumbfile = File.join(@gallery_dir, (last_id + 1).to_s + '-thumb' + ext)
      
      File.open(localfile, "w") { |f| f.write(File.open(data_dest).read) }
      
      # create blank captions.yml if it doesn't already exist
      create_captions_file(@pg.id)
      
      localfile = resize_image(localfile)
      
      small = MiniMagick::Image.from_file(localfile)
      small.crop_resized(GalleryThumbWidth, GalleryThumbHeight)
      small.write(thumbfile)
      
      File.chmod(0644, localfile, thumbfile)
      
      create_preview_images(:force => 1)
      
    elsif ext == '.zip'
      begin
        Zip::File.foreach(data.path) do |zipentry|
          next if ![ '.jpg', '.jpeg', '.png', '.gif' ].include?(File.extname(zipentry.name).downcase) || zipentry.size < 1000
          upload_progress.message = "Extracting #{File.basename(zipentry.name)}"
          localfile = File.join(temp_location, ((last_id+1).to_s + File.extname(zipentry.name)).downcase)
          
          begin
            zipentry.extract(localfile)
            last_id += 1
          rescue StandardError => e
            logger.error(e)
          end
        end
      rescue StandardError => e
        logger.debug params.inspect
        logger.error(e)
        finish_upload_status "''" and return
      end
      
      @images = Dir.glob("#{temp_location}/*.{jpg,jpeg,png,gif}")
      
      @images.each do |img|
        localfile = File.join(@gallery_dir, File.basename(img, File.extname(img))) + '.jpg'
        tempfile = File.join(temp_location, File.basename(img, File.extname(img))) + File.extname(img)
        thumbfile = File.join(@gallery_dir, File.basename(img, File.extname(img))) + '-thumb.jpg'
        
        small = MiniMagick::Image.from_file(tempfile)
        small.crop_resized(GalleryThumbWidth, GalleryThumbHeight)
        small.write(thumbfile)
        
        FileUtils.cp(tempfile, localfile)
        resize_image(localfile)
        
        File.chmod(0644, localfile, thumbfile)
      end
      
      # smaller images for gallery index
      management_dir = File.join(@gallery_dir, 'management')
      
      preview_images = []
      Dir.glob("#{@gallery_dir}/*.{jpg,jpeg,png,gif}").each { |img| preview_images << img unless File.basename(img).include?('thumb') }
      
      preview_images.each { |img| create_preview_image(img, management_dir, 1) }
    end
    
    File.delete(data_dest)
    
    upload_progress.message = "File received successfully."
    finish_upload_status "'#{File.basename(data_dest)}'" and return
  end
  
  def delete_photo
    if request.post?
      @pg = CmsPage.find_by_id(params[:id])
      
      # create blank captions.yml if it doesn't already exist
      create_captions_file(@pg.id)
      
      gallery_dir = File.join(Rails.root, 'public', 'assets', 'content', @pg.path, params[:gallery_id])
      captions = YAML.load(File.open(File.join(gallery_dir, 'captions.yml')).read).to_a
      
      image_id = params[:image].split('.').first.to_i
      
      begin ; File.delete(File.join(gallery_dir, image_id.to_s + '.jpg')) ; rescue ; end
      begin ; File.delete(File.join(gallery_dir, image_id.to_s + '-thumb.jpg')) ; rescue ; end
      begin ; File.delete(File.join(gallery_dir, 'management', image_id.to_s + '.jpg')) ; rescue ; end
      
      all_images = Dir.glob(File.join(gallery_dir, '*.{jpg,jpeg,png,gif}'))
      images = []
      all_images.each { |img| images << img if !File.basename(img).include?('thumb') && File.basename(img).split('.').first.to_i > image_id }
      
      image_names = []
      images.each_with_index { |img, index| image_names << File.basename(img).split('.').first.to_i }
      image_names.sort!
      
      new_captions = []
      for i in 0...image_id do
        new_captions[i] = captions[i] || ''
      end
      
      image_names.each do |img|
        FileUtils.mv(File.join(gallery_dir, img.to_s + '.jpg'), File.join(gallery_dir, image_id.to_s + '.jpg'))
        FileUtils.mv(File.join(gallery_dir, img.to_s + '-thumb.jpg'), File.join(gallery_dir, image_id.to_s + '-thumb.jpg'))
        FileUtils.mv(File.join(gallery_dir, 'management', img.to_s + '.jpg'), File.join(gallery_dir, 'management', image_id.to_s + '.jpg'))
        
        new_captions[image_id] = captions[img] || ''
        
        image_id += 1
      end
      
      yaml = YAML.dump(new_captions)
      File.open(File.join(gallery_dir, 'captions.yml'), "w") { |f| f << yaml }
    end
    
    redirect_to :action => 'gallery_management', :id => params[:id], :gallery_id => params[:gallery_id]
  end
  
  def delete_gallery
    @pg = CmsPage.find_by_id(params[:id])
    galleries_dir = File.join(Rails.root, 'public', 'assets', 'content', @pg.path)
    gallery_dir = File.join(galleries_dir, params[:gallery_id])
    
    FileUtils.rm_rf(gallery_dir)
    
    redirect_to :action => 'select_gallery', :id => params[:id]
  end
  
  
  def upload_file
    @pg = CmsPage.find_by_id(params[:id])
    render :partial => 'upload_file'
  end
  
  def receive_file
    @pg = CmsPage.find_by_id(params[:id])
    
    target_dir = File.join(Rails.root, 'public', 'assets', 'content', @pg.path)
    FileUtils.mkdir_p target_dir
    
    data = params[:file][:data]
    original_filename = data.original_filename.strip.gsub(/[\?\s\/\:\\]+/, '-').gsub(/^-/, '').gsub(/-$/, '')
    localfile = File.join(target_dir, original_filename)
    FileUtils.cp(data.tempfile, localfile)
    File.chmod(0644, localfile)
    
    finish_upload_status "'#{File.basename(localfile)}'"
  end
  
  def create_file_link
    @pg = CmsPage.find_by_id(params[:id])
    localfile = File.join(Rails.root, 'public', 'assets', 'content', @pg.path, File.basename(params[:filename]))
    @filename = localfile.split('/').map { |s| CGI::escape(s) }.join('/') + "?#{File.mtime(localfile).to_i}"
    
    bucket = ImagineCmsConfig['amazon_s3'][Rails.env]['file_bucket'] rescue nil
    prefix = ImagineCmsConfig['amazon_s3']['file_prefix'] rescue nil
    upload_to_s3(localfile, @pg, bucket, prefix)
    
    render :partial => 'create_file_link'
  end
  
  
  def upload_thumb
    @pg = CmsPage.find_by_id(params[:id])
    render :partial => 'upload_thumb'
  end
  
  def crop_thumb
    @pg = CmsPage.find_by_id(params[:id])
    origfile = File.join(Rails.root, 'public', 'assets', 'content', @pg.path, File.basename(params[:filename]))
    newfilename = File.basename(params[:filename], File.extname(params[:filename])) + '-thumb' + File.extname(params[:filename])
    localfile = File.join(Rails.root, 'public', 'assets', 'content', @pg.path, newfilename)
    FileUtils.mv(origfile, localfile)
    File.chmod(0644, localfile)
    
    # get out now if user clicked finish
    if params[:next_clicked].to_i != 1
      @image_file = localfile + "?#{File.mtime(localfile).to_i}"
      upload_to_s3(localfile, @pg)
      render :partial => 'crop_results_thumb' and return
    end
    
    
    # if we're still here... let's crop!
    target_dir = File.join(Rails.root, 'public', 'assets', 'content', @pg.path)
    testfile = File.join(target_dir, File.basename(localfile, File.extname(localfile))) + '-croptest' + File.extname(localfile)
    
    # make a smaller version to help with cropping
    im = MiniMagick::Image.from_file(localfile)
    im.resize("500x400>")
    im.write(testfile)
    File.chmod(0644, testfile)
    
    @width = im[:width]
    @height = im[:height]
    @height = 1 if @height == 0
    @image_file = File.basename(testfile)
    @aspect_ratio = @width.to_f/@height
    
    render :partial => 'crop_thumb'
  end
  
  def save_crop_thumb
    @pg = CmsPage.find_by_id(params[:id])
    target_dir = File.join(Rails.root, 'public', 'assets', 'content', @pg.path)
    testfile = File.join(target_dir, File.basename(params[:filename]))
    localfile = testfile.split(/-croptest/).join('')
    
    # need to scale up requested position/dimensions based on how big test image
    # is relative to original image
    orig_im = MiniMagick::Image.from_file(localfile)
    test_im = MiniMagick::Image::from_file(testfile)
    scale = orig_im[:width].to_f / test_im[:width]
    
    x1 = params[:image][:x1].to_i * scale
    y1 = params[:image][:y1].to_i * scale
    width = params[:image][:width].to_i * scale
    height = params[:image][:height].to_i * scale
    
    max_width = params[:image][:max_width].to_i
    max_height = params[:image][:max_height].to_i
    dirty = false
    
    # crop if user selected something
    if params[:image][:width].to_i > 0
      logger.debug "cropping @ (#{x1}, #{y1}) to size #{width} x #{height}"
      orig_im.crop("#{width}x#{height}+#{x1}+#{y1}")
      dirty = true
    end
    
    # resize if the resultant image is bigger than max dims
    if max_width > 0 && max_height > 0
      if orig_im[:width] > max_width || orig_im[:height] > max_height
        logger.debug "resizing to max dims #{max_width} x #{max_height}"
        orig_im.resize("#{max_width}x#{max_height}>")
        dirty = true
      end
    end
    
    orig_im.write(localfile) if dirty
    File.chmod(0644, localfile)
    
    @image_file = localfile + "?#{File.mtime(localfile).to_i}"
    File.unlink testfile
    upload_to_s3(localfile, @pg)
    
    render :partial => 'crop_results_thumb'
  end
  
  def upload_feature_image
    @pg = CmsPage.find_by_id(params[:id])
    render :partial => 'upload_feature_image'
  end
  
  def crop_feature_image
    @pg = CmsPage.find_by_id(params[:id])
    origfile = File.join(Rails.root, 'public', 'assets', 'content', @pg.path, File.basename(params[:filename]))
    newfilename = File.basename(params[:filename], File.extname(params[:filename])) + '-feature' + File.extname(params[:filename])
    localfile = File.join(Rails.root, 'public', 'assets', 'content', @pg.path, newfilename)
    FileUtils.mv(origfile, localfile)
    
    # get out now if user clicked finish
    if params[:next_clicked].to_i != 1
      @image_file = localfile + "?#{File.mtime(localfile).to_i}"
      upload_to_s3(localfile, @pg)
      render :partial => 'crop_results_feature_image' and return
    end
    
    
    # if we're still here... let's crop!
    target_dir = File.join(Rails.root, 'public', 'assets', 'content', @pg.path)
    testfile = File.join(target_dir, File.basename(localfile, File.extname(localfile))) + '-croptest' + File.extname(localfile)
    
    # make a smaller version to help with cropping
    im = MiniMagick::Image.from_file(localfile)
    im.resize("500x400>")
    im.write(testfile)
    File.chmod(0644, testfile)
    
    @width = im[:width]
    @height = im[:height]
    @height = 1 if @height == 0
    @image_file = File.basename(testfile)
    @aspect_ratio = @width.to_f/@height
    
    render :partial => 'crop_feature_image'
  end
  
  def save_crop_feature_image
    @pg = CmsPage.find_by_id(params[:id])
    target_dir = File.join(Rails.root, 'public', 'assets', 'content', @pg.path)
    testfile = File.join(target_dir, File.basename(params[:filename]))
    localfile = testfile.split(/-croptest/).join('')
    
    # need to scale up requested position/dimensions based on how big test image
    # is relative to original image
    orig_im = MiniMagick::Image.from_file(localfile)
    test_im = MiniMagick::Image::from_file(testfile)
    scale = orig_im[:width].to_f / test_im[:width]
    
    x1 = params[:image][:x1].to_i * scale
    y1 = params[:image][:y1].to_i * scale
    width = params[:image][:width].to_i * scale
    height = params[:image][:height].to_i * scale
    
    max_width = params[:image][:max_width].to_i
    max_height = params[:image][:max_height].to_i
    dirty = false
    
    # crop if user selected something
    if params[:image][:width].to_i > 0
      logger.debug "cropping @ (#{x1}, #{y1}) to size #{width} x #{height}"
      orig_im.crop("#{width}x#{height}+#{x1}+#{y1}")
      dirty = true
    end
    
    # resize if the resultant image is bigger than max dims
    if max_width > 0 && max_height > 0
      if orig_im[:width] > max_width || orig_im[:height] > max_height
        logger.debug "resizing to max dims #{max_width} x #{max_height}"
        orig_im.resize("#{max_width}x#{max_height}>")
        dirty = true
      end
    end
    
    orig_im.write(localfile) if dirty
    File.chmod(0644, localfile)
    
    @image_file = localfile + "?#{File.mtime(localfile).to_i}"
    File.unlink testfile
    upload_to_s3(localfile, @pg)
    
    render :partial => 'crop_results_feature_image'
  end
  
  
  protected
    
    def cms_page_params
      params.require(:pg).permit(:cms_template_id, :cms_template_version, :parent_id, :published_version,
                                 :name, :title, :path, :html_head, :summary, :position,
                                 :article_date, :article_end_date, :published_date, :expiration_date, :expires,
                                 :thumbnail_path, :feature_image_path, :redirect_enabled, :redirect_to)
    end
    
    def cms_template_params
      params.require(:temp).permit(:name, :content)
    end
    
    def cms_snippet_params
      params.require(:snip).permit(:name, :content)
    end
    
    def load_page_objects
      @page_objects = OpenStruct.new
      @template_options = OpenStruct.new
      
      if @pg.new_record? && @parent
        @parent.objects.where(:obj_type => 'attribute').each do |obj|
          next if defined?(CmsNewPagesDoNotInherit) && CmsNewPagesDoNotInherit['attributes'] && CmsNewPagesDoNotInherit['attributes'].include?(obj.name)
          key = "obj-#{obj.obj_type.to_s}-#{obj.name}"
          @page_objects[key] = obj.content
        end
        @parent.objects.where(:obj_type => 'option').each do |obj|
          next if defined?(CmsNewPagesDoNotInherit) && CmsNewPagesDoNotInherit['options'] && CmsNewPagesDoNotInherit['options'].include?(obj.name)
          key = "obj-#{obj.obj_type.to_s}-#{obj.name}"
          @page_objects[key] = obj.content
        end
      else
        @tags = @pg.tags.map { |t| t.name }.join(', ')
        @pg.objects.where(:obj_type => 'attribute').each do |obj|
          key = "obj-#{obj.obj_type.to_s}-#{obj.name}"
          @page_objects[key] = obj.content
        end
        @pg.objects.where(:obj_type => 'option').each do |obj|
          key = "obj-#{obj.obj_type.to_s}-#{obj.name}"
          @page_objects[key] = obj.content
        end
      end
    end
    
    def load_template_options
      begin
        render_to_string :inline => @pg.template.content
      rescue StandardError => e
        logger.debug e
      end
    end
    
    def garbage_collect
      GC.start
    end
    
    def create_captions_file(pg_id, options = {})
      @pg ||= CmsPage.find_by_id(pg_id)
      gallery_id = options[:gallery_id] || params[:gallery_id]
      captions_file =  File.join(Rails.root, 'public', 'assets', 'content', @pg.path, gallery_id, 'captions.yml')
      return if File.exist?(captions_file)
      
      File.open(captions_file, 'w') { |f| YAML.dump([0], f) }
    end
    
    # prerequisites: @pg (CmsPage)
    def load_gallery_settings_from_file(gallery_id, options = {})
      galleries_dir = File.join(Rails.root, 'public', 'assets', 'content', @pg.path)
      gallery_dir = File.join(galleries_dir, gallery_id)
      settings_location = File.join(gallery_dir, 'settings.yml')
      
      ret = {}
      
      if File.exist?(settings_location)
        File.open(settings_location, 'r') { |f| ret = YAML.load(f.read) }
      else
        File.open(settings_location, 'w') { |f| YAML.dump({}, f) }
      end
      
      # set a few defaults
      ret['slide_duration'] ||= 0
      ret['autoplay'] ||= true
      ret['show_thumbs'] ||= true
      
      return OpenStruct.new(ret)
    end
    
    # prerequisites: @pg (CmsPage)
    def save_gallery_settings_to_file(gallery_id, settings_hash, options = {})
      settings_hash = settings_hash.hash if settings_hash.kind_of?(OpenStruct)
      
      galleries_dir = File.join(Rails.root, 'public', 'assets', 'content', @pg.path)
      gallery_dir = File.join(galleries_dir, gallery_id)
      settings_location = File.join(gallery_dir, 'settings.yml')
      
      File.open(settings_location, 'w') { |f| YAML.dump(settings_hash, f) }
    end
    
    def resize_image(localfile)
      im = MiniMagick::Image::from_file(localfile)
      
      if im[:width] > GalleryMaxWidth || im[:height] > GalleryMaxHeight
        im.resize("#{GalleryMaxWidth}x#{GalleryMaxHeight}")
        im.write(localfile)
      end
      
      localfile
    end
    
    def create_preview_image(src_file, dest, force = 0, overlay = 'gallery_small_overlay.png', thumb_size = 90)
      raise "Source file required" if src_file.blank?
      
      dest = File.join(dest, File.basename(src_file)) if File.directory?(dest)
      if !File.exist?(dest) || force == 1
        logger.debug "Reading source file #{src_file}"
        im = Magick::Image::read(src_file)[0]
        im_overlay = Magick::Image::read(File.join(ImagineCms::Engine.root, 'app', 'assets', 'images', 'management', overlay))[0]
        
        im.crop_resized!(thumb_size, thumb_size)
        im = im.composite(im_overlay, Magick::CenterGravity, Magick::OverCompositeOp)
        
        im.write(dest)
        File.chmod(0644, dest)
        
        im = im_overlay = nil
        GC.start
        
        nil
      end
    end
    
    # prerequisites: @pg (CmsPage)
    def create_preview_images(options = {})
      galleries_dir = File.join(Rails.root, 'public', 'assets', 'content', @pg.path)
      session[:broken_galleries] = []
      
      # create preview images if not already made
      Dir.glob("#{galleries_dir}/gallery_*").each do |g|
        begin
          management_dir = File.join(g, 'management')
          FileUtils.mkdir_p(management_dir) unless File.exist?(management_dir)
          
          images = Dir.glob("#{g}/*.{jpg,jpeg,png,gif}")
          preview_images = []
          images.each { |img| preview_images << img unless File.basename(img).include?('thumb') }
          
          # gallery preview image
          preview_image_location = File.join(management_dir, 'preview.jpg')
          unless File.exist?(preview_image_location)
            preview_image = preview_images.first
            create_preview_image(preview_image, preview_image_location, options[:force], 'gallery_preview_overlay.png', 130)
          end
          
          # photo preview images
          preview_images.each { |img| create_preview_image(img, management_dir, options[:force]) }
          
        rescue StandardError => e
          # some error handling here
          session[:broken_galleries] << File.basename(g)
          
          logger.error(e)
        end
      end
    end
    
    def upload_to_s3(filename, page, bucket = nil, prefix = nil)
      s3retries = 0
      s3success = false
      
      if ImagineCmsConfig['amazon_s3'] && ImagineCmsConfig['amazon_s3']['enabled']
        s3 = Aws::S3::Client.new
        
        bucket ||= ImagineCmsConfig['amazon_s3'][Rails.env]['image_bucket']
        prefix ||= ImagineCmsConfig['amazon_s3']['image_prefix']
        
        params = {}
        params[:bucket] = bucket
        params[:key] = "#{prefix}/#{page.path.blank? ? 'index' : page.path}/#{File.basename(filename)}"
        params[:body] = open(filename)
        params[:acl] = 'public-read'
        params[:metadata] = ImagineCmsConfig['amazon_s3']['metadata']
        
        while !s3success && s3retries < 2
          response = s3.put_object(params)
          s3success = response.successful?
          s3retries += 1
        end
        File.unlink(filename) if s3success
      end
      
      s3success
    end
    
end

module MiniMagick
  class Image
    def crop_resized(ncols, nrows, gravity='Center')
      columns = self[:width].to_i
      rows = self[:height].to_i
      
      if ncols != columns || nrows != rows
        scale = [ncols/columns.to_f, nrows/rows.to_f].max
        resize("#{scale*(columns+0.5).to_i}x#{scale*(rows+0.5).to_i}")
      end
      
      columns = self[:width].to_i
      rows = self[:height].to_i
      crop("#{ncols}x#{nrows}+0+0", "-gravity", "#{gravity}") if ncols != columns || nrows != rows
    end
  end
end
