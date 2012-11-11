class Management::CmsController < Management::ApplicationController # :nodoc:
  before_filter :check_permissions
  before_filter :block_basic_users, :except => [
    :index, :edit_page_content,
    :include_codepress, :disable_caching, :garbage_collect,
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
    
    :pages, :list_pages, :edit_page, :page_attribute, :set_page_version
  ]
  
  before_filter :convert_invalid_chars_in_params
  
  upload_status_for :receive_image
  upload_status_for :add_to_gallery
  
  cache_sweeper :cms_content_sweeper
  
  def check_permissions
    if !user_has_permission?(:manage_cms)
      render '/errors/permission_denied'
      return false
    end
  end
  
  def block_basic_users
    return true unless UseCmsAccessLevels
    unless user_has_permission?(:manage_cms_full_access) && @user.cms_allowed_sections.to_s.strip.blank?
      render '/errors/permission_denied'
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
    
    return true
  end
  
  
  def index
  end
  
  def templates
    @temps = CmsTemplate.find(:all, :order => 'name')
  end
  
  def edit_template
    @temp = CmsTemplate.find_by_id(params[:id]) || CmsTemplate.new
    
    if request.post?
      @temp.assign_attributes(params[:temp])
      
      begin
        @pg = CmsPage.new
        @page_objects = HashObject.new
        render_to_string :inline => @temp.content
      rescue Exception => e
        message = e.message
        flash.now[:error] = "<pre>#{ERB::Util.html_escape(message)}</pre>".html_safe
        logger.debug e
        return
      end
      
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
    @snippets = CmsSnippet.find(:all, :order => 'name')
  end
  
  def edit_snippet
    @snip = CmsSnippet.find_by_id(params[:id]) || CmsSnippet.new
    
    if request.post?
      @snip.assign_attributes(params[:snip])
      
      begin
        @pg = CmsPage.new
        @page_objects = HashObject.new
        render_to_string :inline => @snip.content
      rescue Exception => e
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
  
  #
  # AKN 2012-11-08: This was never really a good idea. Need to figure out a better way. Disabling for now.
  #
  
  # def edit_master
  #   @file_type = case params[:id]
  #     when 'template' then 'html'
  #     when 'web_stylesheet', 'print_stylesheet' then 'css'
  #     else nil
  #   end
  #   
  #   filename = case params[:id]
  #     when 'template'         then File.join('app', 'views', 'layouts', 'application.rhtml')
  #     when 'web_stylesheet'   then File.join('public', 'stylesheets', 'default.css')
  #     when 'print_stylesheet' then File.join('public', 'stylesheets', 'print.css')
  #     when 'ie_stylesheet'    then File.join('public', 'stylesheets', 'ie.css')
  #     when 'ie6_stylesheet'   then File.join('public', 'stylesheets', 'ie6.css')
  #   end
  #   filename = File.join(Rails.root, filename)
  #   
  #   case request.method
  #   when :get
  #     @file_content = File.open(filename, 'r').read
  #   when :post
  #     begin
  #       @pg = CmsPage.new
  #       @page_objects = HashObject.new
  #       render_to_string :inline => params[:file_content]
  #     rescue Exception => e
  #       message = e.message
  #       flash.now[:error] = "<pre>#{ERB::Util.html_escape(message)}</pre>"
  #       logger.debug e
  #       return
  #     end
  #     
  #     begin
  #       if params[:file_content].empty?
  #         flash[:error] = 'An error occurred, please contact support.'
  #       else
  #         File.open(filename, 'w') { |f| f.write(params[:file_content]) }
  #         flash[:notice] = 'File saved.'
  #       end
  #       
  #       CmsPage.find(:all).each do |page|
  #         expire_page :controller => 'cms/content', :action => 'show', :content_path => page.path.split('/')
  #       end
  #       
  #       redirect_to :action => 'edit_master', :id => params[:id]
  #     rescue Exception => e
  #       message = e.message
  #       flash.now[:error] = "<pre>#{ERB::Util.html_escape(message)}</pre>"
  #       log_error(e)
  #     end
  #   end
  # end
  
  def pages
    @page_levels = [ '' ].concat((params[:path] || session[:cms_pages_path] || '').split('/').reject { |l| l.empty? })
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
    
    @attrs = CmsPageObject.find(:all, :conditions => [ "obj_type = 'attribute'" ], :order => 'name').map { |attr| attr.name }.uniq
    
    if params[:mode] == 'ajax_new' || params[:mode] == 'ajax_edit'
      @pg.published_version = -1 if params[:mode] == 'ajax_new'
      load_page_objects
      load_template_options
      render :partial => 'edit_page' and return
    end
    
    if request.post?
      params[:pg] ||= {}
      
      if params[:pg][:article_date_year]
        params[:pg][:article_date] = Time.utc(params[:pg].delete(:article_date_year),
                                                 params[:pg].delete(:article_date_month),
                                                 params[:pg].delete(:article_date_day))
      end
      if params[:pg][:article_end_date_year]
        params[:pg][:article_end_date] = Time.utc(params[:pg].delete(:article_end_date_year),
                                                     params[:pg].delete(:article_end_date_month),
                                                     params[:pg].delete(:article_end_date_day))
      end
      if params[:pg][:published_date_year]
        params[:pg][:published_date] = Time.utc(params[:pg].delete(:published_date_year),
                                                   params[:pg].delete(:published_date_month),
                                                   params[:pg].delete(:published_date_day))
      end
      if params[:pg][:expires]
        date = Time.utc(params[:pg].delete(:expiration_date_year),
                           params[:pg].delete(:expiration_date_month),
                           params[:pg].delete(:expiration_date_day))
        params[:pg][:expiration_date] = date if params[:pg][:expires] == 'true'
      end
      
      @pg.assign_attributes(params[:pg])
      unless params[:use_article_date_range].to_i > 0
        @pg.article_end_date = nil
      end
      @pg.updated_by ||= session[:user_id]
      @pg.updated_by_username ||= session[:user_username]
      
      save_function = @pg.new_record? ? 'save' : 'save_without_revision'
      
      if @pg.send(save_function)
        # now try to save tags
        begin
          tags_to_delete = @pg.tags
          params[:tags].split(',').map { |t| t.strip }.reject { |t| t.empty? }.compact.each do |t|
            @pg.tags.create(:name => t) unless @pg.tags.find_by_name(t)
            tags_to_delete.reject! { |tag| tag.name == t }
          end
          tags_to_delete.each { |t| t.destroy }
        rescue Exception => e
          logger.debug e
        end
        
        # now try to save page objects (just attributes in this case)
        begin
          objects_to_delete = @pg.objects.find(:all, :conditions => [ "obj_type = 'attribute' or obj_type = 'option'" ])
          
          (params[:page_objects] || {}).each do |key,val|
            next if key.empty? || val.empty?
            
            key =~ /^obj-(\w+?)-(.+?)$/
            obj = @pg.objects.find(:first, :conditions => [ "name = ? and obj_type = ?", $2, $1 ])
            obj ||= @pg.objects.build(:name => $2, :obj_type => $1)
            obj.content = val
            obj.save
            objects_to_delete.reject! { |obj| obj.name == $2 }
          end
          
          objects_to_delete.each { |t| t.destroy }
        rescue Exception => e
          logger.debug e
        end
        
        render :update do |page|
          case params[:return_to]
          when 'preview'
            page.redirect_to "/#{@pg.path}"
          else
            flash[:notice] = 'Page saved.'
            session[:cms_pages_path] = @pg.path
            page.redirect_to :action => 'pages'
          end
        end
        
      else
        # save failed, display errors
        render :update do |page|
          page.replace_html 'save_errors', @pg.errors.full_messages.join('<br/>')
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
    @page_levels = [ '' ].concat((params[:path] || session[:cms_pages_path] || '').split('/').reject { |l| l.empty? })
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
    
    @page_objects = HashObject.new({ params[:name] => params[:value] })
    render :partial => 'page_attribute', :locals => { :name => params[:name] }
  end
  
  def edit_page_content
    @pg = CmsPage.find(params[:id])
    validate_user_access or return
    
    @page_objects = HashObject.new(params[:page_objects] || {})
    
    if request.get?
      @pg.revert_to(params[:version]) if params[:version]
      @pg.objects.find(:all, :conditions => [ 'cms_page_version = ?', @pg.version ]).each do |obj|
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
      @cms_head << "<script type=\"text/javascript\" src=\"#{url_for(:action => 'page_tags_for_lookup')}\"></script>"
      
      @template_content = substitute_placeholders(@pg.template.content, @pg)
      render :layout => 'application'
    
    elsif request.post?
      CmsPage.transaction do
        # need to revise this later if we implement deletion of page objects
        old_objs = @pg.objects.find(:all, :conditions => [ 'cms_page_version = ?', @pg.version ])
        
        @pg.updated_by = session[:user_id]
        @pg.updated_by_username = session[:user_username]
        
        # if basic user, make sure published version is not set to 'latest'
        if (UseCmsAccessLevels && !user_has_permission?(:manage_cms_full_access)) && @pg.published_version == 0
          @pg.published_version = @pg.version
        end
        
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
            for i in 0...@page_objects["#{key}-sources-tag-count"].to_i
              tags << @page_objects["#{key}-sources-tag#{i}"]
            end
            tags.reject! { |tag| tag.empty? }
            @page_objects["#{key}-sources-tag-count"] = tags.size
            tags.each_with_index do |tag, i|
              @page_objects["#{key}-sources-tag#{i}"] = tag
            end
          end
          # optimize source lists: folders
          if @page_objects["#{key}-sources-folder-count"].to_i > 0
            folders = []
            for i in 0...@page_objects["#{key}-sources-folder-count"].to_i
              folders << @page_objects["#{key}-sources-folder#{i}"]
            end
            folders.reject! { |folder| folder.empty? }
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
          
          # do a little bit of "censorship" to fix up Word pastes
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
            
            # pirate styles not welcome
            val.gsub!(/<style>(.*?)<\/style>/m, '')
            
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
          end
          
          obj.content = val
          obj.save
        end
        
        old_objs.each do |obj|
          unless @pg.objects.find(:all, :conditions => [ 'name = ? and cms_page_version = ?', obj.name, @pg.version])
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
    @pg.objects.find(:all, :conditions => [ 'cms_page_version = ?', @pg.version]).each do |obj|
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
    @tags = CmsPageTag.find(:all, :order => 'name').map { |tag| tag.name }.uniq
    headers['content-type'] = 'text/javascript'
    render :layout => false
  end
  
  def page_attributes_for_lookup
    @attrs = CmsPageObject.find(:all, :conditions => [ "obj_type = 'attribute'" ], :order => 'name').map { |attr| attr.name }.uniq
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
      end
    end
    
    render :nothing => true
  end
  
  def request_review
    @pg = CmsPage.find(params[:id])
    @version = params[:version].to_i
    
    # send email to request administrative review
    # find all users with email address set
    User.find(:all).reject { |u| !u.active? || !u.can_manage_cms_publishing? || !u.cms_allowed_sections.blank? }.each do |u|
      next unless valid_email_address?(u.email_address)
      begin
        Mailer.deliver_cms_request_review(url_for(:controller => '/cms/content', :action => 'show', :content_path => []) + @pg.path, @pg.title, @version, u, @user, params[:change_description].to_s)
      rescue Exception => e
        log_error(e)
      end
    end
    
    render :nothing => true
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
      @page_objects[key] = options[:content] if @page_objects[key].empty?
      text_field(:page_objects, key, options)
    when :text
      @page_objects[key] = options[:content] if @page_objects[key].empty?
      focusOnLoad = !defined?(@cms_text_editor_placed)
      @cms_text_editor_placed = true
      content = ''.html_safe
      content << text_area(:page_objects, key, { :dojoType => 'Editor2', :toolbarGroup => 'main', :isToolbarGroupLeader => 'false',
                           :focusOnLoad => focusOnLoad.to_s, :style => 'border: 2px dashed gray; padding: 5px',
                           :minHeight => '100px' }.update(html_options))
      content << content_tag(:div, ''.html_safe, :id => "page_object_config_#{key}")
      content << javascript_tag("addLoadEvent(function () { scanForPageObjects(#{@pg.id}, '#{key}', #{@pg.version}); });")
      content << observe_field("page_objects_#{key}", :function => "scanForPageObjects(#{@pg.id}, '#{key}', #{@pg.version});", :frequency => 2)
      content
    when :page_list
      @page_objects["#{key}-min-item-count"] ||= 3 unless options[:item_min_count]
      @page_objects["#{key}-max-item-count"] ||= 5 unless options[:item_count]
      @page_objects["#{key}-item-offset"] ||= 0 unless options[:item_offset]
      @page_objects["#{key}-sort-first-field"] ||= options[:primary_sort_key]
      @page_objects["#{key}-sort-first-direction"] ||= options[:primary_sort_direction]
      @page_objects["#{key}-sort-second-field"] ||= options[:secondary_sort_key]
      @page_objects["#{key}-sort-second-direction"] ||= options[:secondary_sort_direction]
      
      render_to_string(:partial => 'page_list', :locals => { :name => name, :key => key }).html_safe
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
    target_dir = File.join(Rails.root, 'public', 'images', 'content', @pg.path)
    
    if File.exists?(target_dir)
      redirect_to :action => 'select_gallery', :id => @pg, :gallery_id => params[:gallery_id]
    else
      render :partial => 'upload_image'
    end
  end
  
  def receive_image
    @pg = CmsPage.find_by_id(params[:id])
    begin
      data = params[:file][:data]
      original_filename = data.original_filename
      target_dir = File.join(Rails.root, 'public', 'assets', 'content', @pg.path)
      localfile = File.join(target_dir, original_filename)
      
      begin
        FileUtils.mkdir_p target_dir
      rescue Exception => e
        logger.debug "Exception: #{e}"
        log_error(e)
        finish_upload_status "''" and return
      end
      
      unless params[:overwrite].to_i == 1
        count = 0
        while File.exists?(localfile)
          count += 1
          localfile = File.join(target_dir, File.basename(original_filename, File.extname(original_filename))) + "-#{count}" + File.extname(original_filename)
        end
      end
      
      begin
        File.open(localfile, 'wb') { |f| f.write('test') }
      rescue Exception => e
        logger.debug "Exception: #{e}"
        log_error(e)
        finish_upload_status "''" and return
      end
      
      begin
        File.open(localfile, 'wb') { |f| f.write(data.read) }
      rescue Exception => e
        logger.debug "Exception: #{e}"
        log_error(e)
        finish_upload_status "''" and return
      end
    rescue Exception => e
      logger.debug params.inspect
      # logger.debug "Exception: #{e}"
      log_error(e)
      finish_upload_status "''" and return
    end
    
    upload_progress.message = "File received successfully."
    finish_upload_status "'#{File.basename(localfile)}'" and return
  end
  
  def crop_image
    @pg = CmsPage.find_by_id(params[:id])
    localfile = File.basename(params[:filename])
    
    # get out now if user clicked finish
    if params[:next_clicked].to_i != 1
      @image_file = localfile
      render :partial => 'crop_results' and return
    end
    
    
    # if we're still here... let's crop!
    target_dir = File.join(Rails.root, 'public', 'images', 'content', @pg.path)
    localfile = File.join(target_dir, localfile)
    testfile = File.join(target_dir, File.basename(localfile, File.extname(localfile))) + '-croptest' + File.extname(localfile)
    
    # make a smaller version to help with cropping
    im = MiniMagick::Image.from_file(localfile)
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
    target_dir = File.join(Rails.root, 'public', 'images', 'content', @pg.path)
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
    @image_file = localfile
    File.unlink testfile
    
    render :partial => 'crop_results'
  end
  
  def receive_gallery
    require 'zip/zip'
    
    @pg = CmsPage.find_by_id(params[:id])
    begin
      data = params[:gallery_file][:data]
      target_dir = File.join(Rails.root, 'public', 'images', 'content', @pg.path)
      localdir = File.join(target_dir, 'gallery_1')
      
      begin
        FileUtils.mkdir_p target_dir
      rescue Exception => e
        logger.debug "Exception: #{e}"
        log_error(e)
        finish_upload_status "''" and return
      end
      
      unless params[:overwrite].to_i == 1
        count = 1
        while File.exists?(localdir)
          count += 1
          localdir = File.join(target_dir, "gallery_#{count}")
        end
      end
      
      begin
        FileUtils.mkdir_p File.join(localdir, 'temp')
      rescue Exception => e
        logger.debug "Exception: #{e}"
        log_error(e)
        finish_upload_status "''" and return
      end
      
      # read zip file
      entries = []
      Zip::ZipFile.foreach(data.path) do |zipentry|
        next if ![ '.jpg', '.jpeg', '.png', '.gif' ].include?(File.extname(zipentry.name).downcase) || zipentry.size < 1000
        next if File.basename(zipentry.name) =~ /^\._/
        
        entries << zipentry
      end
      entries.sort! { |a,b| File.basename(a.name).downcase <=> File.basename(b.name).downcase }
      
      Zip::ZipFile.open(data.path) do |zipfile|
        entries.each_with_index do |zipentry, index|
          upload_progress.message = "Extracting #{File.basename(zipentry.name)}"
          ext = File.extname(zipentry.name)
          #name = File.basename(zipentry.name, ext)
          #localfile = File.join(localdir, 'temp', name.downcase.gsub(/[^\w\d]/, '') + ext.downcase)
          localfile = File.join(localdir, 'temp', (index+1).to_s + ext.downcase)
          jpgfile = File.join(localdir, 'temp', (index+1).to_s + '.jpg')
          
          begin
            zipentry.extract(localfile)
            
            im = MiniMagick::Image.from_file(localfile)
            im.write(jpgfile)
            
            File.unlink(localfile) if localfile != jpgfile
            
          rescue Exception => e
            log_error(e)
          end
        end
      end
    rescue Exception => e
      logger.debug params.inspect
      log_error(e)
      finish_upload_status "''" and return
    end
    
    upload_progress.message = "File received successfully."
    finish_upload_status "'#{File.basename(localdir)}'" and return
  end
  
  def gallery_setup
    @pg = CmsPage.find_by_id(params[:id])
    target_dir = File.join('images', 'content', @pg.path)
    @dirname = File.join(target_dir, File.basename(params[:dirname]), 'temp')
    Dir.chdir(File.join(Rails.root, 'public'))
    @images = Dir.glob("#{@dirname}/*.{jpg,jpeg,png,gif}").sort
    Dir.chdir(Rails.root)
    @thumbs = []
    
    @images.each do |img|
      next if img.include?('-thumb')
      
      thumbfile = File.join(Rails.root, 'public', @dirname, File.basename(img, File.extname(img))) + '-thumb.jpg'
      #@thumbs << File.basename(img, File.extname(img))
      @thumbs << File.join(@dirname, File.basename(img, File.extname(img))) + 
'-thumb.jpg'
      
      next if File.exists?(thumbfile)
      
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
    target_dir = File.join('images', 'content', @pg.path)
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
      rescue Exception => e
        # not that big a deal if we can't delete
      end
    end
    
    begin
      Dir.rmdir(File.join(Rails.root, 'public', @dirname, 'temp'))
    rescue Exception => e
      # not that big a deal if we can't delete
    end
    
    create_preview_images
    
    render :partial => 'complete_gallery'
  end

  def gallery_management
    @pg = CmsPage.find_by_id(params[:id])
    galleries_dir = File.join(Rails.root, 'public', 'images', 'content', @pg.path)
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
    @target_dir = File.join(Rails.root, 'public', 'images', 'content', @pg.path)
    @galleries = Dir.glob("#{@target_dir}/gallery_*")
    
    create_preview_images
    
    if request.post?
      unless params[:gallery_id].downcase == "new"
        redirect_to :action => 'gallery_management', :id => @pg, :gallery_id => params[:gallery_id] and return
      else
        render :partial => 'upload_image' and return
      end
    else
      render :partial => 'select_gallery' and return
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
    gallery_dir = File.join(Rails.root, 'public', 'images', 'content', @pg.path, params[:gallery_id])
    
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
    gallery_dir = File.join(Rails.root, 'public', 'images', 'content', @pg.path, params[:gallery_id])
    temp_dir = File.join(gallery_dir, 'temp')
    sorted_images = session[:gallery_images_sorted] || []
    
    if sorted_images == []
      redirect_to :action => 'gallery_management', :id => @pg, :gallery_id => params[:gallery_id]
      return
    end
    
    FileUtils.rm_rf(temp_dir)
    Dir.mkdir(temp_dir)
    
    # create blank captions.yml if it doesn't already exist
    create_captions_file(@pg.id)
    
    original_captions = YAML.load_file(File.join(gallery_dir, 'captions.yml')).to_a
    captions = []
    captions << original_captions[0]
    
    sorted_images.each_with_index do |img, i|
      localfile = File.join(gallery_dir, img)
      thumbfile = File.join(gallery_dir, img.split('.')[0] + '-thumb.jpg')
      
      temp_localfile = File.join(temp_dir, (i + 1).to_s + '.jpg')
      temp_thumbfile = File.join(temp_dir, (i + 1).to_s + '-thumb.jpg')
      
      begin ; FileUtils.cp(localfile, temp_localfile) ; rescue ; end
      begin ; FileUtils.cp(thumbfile, temp_thumbfile) ; rescue ; end
      
      captions[i + 1] = original_captions[img.split('.')[0].to_i] || ''
    end
    
    File.open(File.join(gallery_dir, 'captions.yml'), 'w') { |f| YAML.dump(captions, f) }
    
    images = Dir.glob("#{gallery_dir}/*.{jpg,jpeg,png,gif}")
    temp_images = Dir.glob("#{temp_dir}/*.{jpg,jpeg,png,gif}")
    
    images.each { |img| File.delete(img) }
    temp_images.each { |img| FileUtils.cp(img, File.join(gallery_dir, File.basename(img))) }
    
    FileUtils.rm_rf(File.join(gallery_dir, 'management'))
    create_preview_images(:force => 1)
    
    FileUtils.rm_rf(temp_dir)
    session[:gallery_images_sorted] = nil
    
    redirect_to :action => 'gallery_management', :id => @pg, :gallery_id => params[:gallery_id]
  end
  
  def image_details
    gallery_dir = File.join(Rails.root, 'public', 'images', 'content', params[:path].to_s, params[:gallery_id])
    
    # create blank captions.yml if it doesn't already exist
    create_captions_file(params[:id])
    
    captions = YAML.load(File.open(File.join(gallery_dir, 'captions.yml')).read)
    image_id = params[:image].split('.')[0].to_i
    @caption = captions[image_id]
    
    render :partial => 'image_details'
  end
  
  def update_caption
    if request.post?
      gallery_dir = File.join(Rails.root, 'public', 'images', 'content', params[:path].to_s, params[:gallery_id])
      
      image_id = params[:image].split('.')[0].to_i
      
      # create blank captions.yml if it doesn't already exist
      create_captions_file(params[:id])
      
      captions = YAML.load_file(File.join(gallery_dir, 'captions.yml')).to_a
      captions[image_id] = params[:caption]
      
      File.open(File.join(gallery_dir, 'captions.yml'), "w") { |f| YAML.dump(captions, f) }
    end
    
    redirect_to :action => 'gallery_management', :id => params[:id], :gallery_id => params[:gallery_id]
  end
  
  def add_to_gallery
    @pg = CmsPage.find_by_id(params[:id])
    galleries_dir = File.join(Rails.root, 'public', 'images', 'content', @pg.path)
    @galleries = Dir.entries(galleries_dir).sort
    @gallery_dir = File.join(galleries_dir, params[:gallery_id])    
    images = Dir.glob("#{@gallery_dir}/*-thumb.{jpg,jpeg,png,gif}")
    
    temp_location = File.join(@gallery_dir ,'temp')
    FileUtils.rm_rf(temp_location)
    Dir.mkdir(temp_location)
    
    data = params[:gallery_file][:data]
    data_dest = File.join(temp_location, data.original_filename)
    File.open(data_dest, "w") { |f| f.write(data.read) }
    
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
      require 'zip/zip'
      
      begin
        Zip::ZipFile.foreach(data.path) do |zipentry|
          next if ![ '.jpg', '.jpeg', '.png', '.gif' ].include?(File.extname(zipentry.name).downcase) || zipentry.size < 1000
          upload_progress.message = "Extracting #{File.basename(zipentry.name)}"
          localfile = File.join(temp_location, ((last_id+1).to_s + File.extname(zipentry.name)).downcase)
          
          begin
            zipentry.extract(localfile)
            last_id += 1
          rescue Exception => e
            log_error(e)
          end
        end
      rescue Exception => e
        logger.debug params.inspect
        log_error(e)
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
      gallery_dir = File.join(Rails.root, 'public', 'images', 'content', params[:path].to_s, params[:gallery_id])
      
      image_id = params[:image].split('.')[0].to_i
      
      begin ; File.delete(File.join(gallery_dir, image_id.to_s + '.jpg')) ; rescue ; end
      begin ; File.delete(File.join(gallery_dir, image_id.to_s + '-thumb.jpg')) ; rescue ; end
      begin ; File.delete(File.join(gallery_dir, 'management', image_id.to_s + '.jpg')) ; rescue ; end
      
      all_images = Dir.glob(File.join(gallery_dir, '*.{jpg,jpeg,png,gif}'))
      images = []
      all_images.each { |img| images << img if !File.basename(img).include?('thumb') and File.basename(img).split('.')[0].to_i > image_id }
      
      image_names = []
      images.each_with_index { |img, index| image_names << File.basename(img).split('.')[0].to_i }
      image_names.sort!
      
      # create blank captions.yml if it doesn't already exist
      create_captions_file(params[:id])
      captions = YAML.load(File.open(File.join(gallery_dir, 'captions.yml')).read).to_a
      
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
      
      File.open(File.join(gallery_dir, 'captions.yml'), "w") { |f| f.write(YAML.dump(new_captions)) }
    end
    
    redirect_to :action => 'gallery_management', :id => params[:id], :gallery_id => params[:gallery_id]
  end
  
  def delete_gallery
    @pg = CmsPage.find_by_id(params[:id])
    galleries_dir = File.join(Rails.root, 'public', 'images', 'content', @pg.path)
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
    begin
      data = params[:file][:data]
      original_filename = data.original_filename.downcase.gsub(/[^\.\w\d]+/, '_')
      target_dir = File.join(Rails.root, 'public', 'files', 'content', @pg.path)
      localfile = File.join(target_dir, original_filename)
      
      begin
        FileUtils.mkdir_p target_dir
      rescue Exception => e
        logger.debug "Exception: #{e}"
        log_error(e)
        finish_upload_status "''" and return
      end
      
      unless params[:overwrite].to_i == 1
        count = 0
        while File.exists?(localfile)
          count += 1
          localfile = File.join(target_dir, File.basename(original_filename, File.extname(original_filename))) + "-#{count}" + File.extname(original_filename)
        end
      end
      
      begin
        File.open(localfile, 'wb') { |f| f.write('test') }
      rescue Exception => e
        logger.debug "Exception: #{e}"
        log_error(e)
        finish_upload_status "''" and return
      end
      
      begin
        File.open(localfile, 'wb') { |f| f.write(data.read) }
      rescue Exception => e
        logger.debug "Exception: #{e}"
        log_error(e)
        finish_upload_status "''" and return
      end
    rescue Exception => e
      logger.debug params.inspect
      # logger.debug "Exception: #{e}"
      log_error(e)
      finish_upload_status "''" and return
    end
    
    upload_progress.message = "File received successfully."
    finish_upload_status "'#{File.basename(localfile)}'" and return
  end
  
  def create_file_link
    @pg = CmsPage.find_by_id(params[:id])
    target_dir = File.join('files', 'content', @pg.path)
    @filename = File.join(target_dir, File.basename(params[:filename]))
    render :partial => 'create_file_link'
  end
  
  
  def upload_thumb
    @pg = CmsPage.find_by_id(params[:id])
    render :partial => 'upload_thumb'
  end
  
  def crop_thumb
    @pg = CmsPage.find_by_id(params[:id])
    localfile = File.basename(params[:filename])
    
    # get out now if user clicked finish
    if params[:next_clicked].to_i != 1
      @image_file = localfile
      render :partial => 'crop_results_thumb' and return
    end
    
    
    # if we're still here... let's crop!
    target_dir = File.join(Rails.root, 'public', 'images', 'content', @pg.path)
    localfile = File.join(target_dir, localfile)
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
    target_dir = File.join(Rails.root, 'public', 'images', 'content', @pg.path)
    testfile = File.join(target_dir, File.basename(params[:filename]))
    localfile = testfile.split(/-croptest/).join('')
    
    # need to scale up requested position/dimensions based on how big test image
    # is relative to original image
    orig_im = MiniMagick::Image.from_file(localfile)
    test_im = MiniMagick::Image::from_file(testfile)
    scale = orig_im[:width].to_f / test_im[:width]
    
    x1 = params[:image][:x1].to_i * scale
    y1 = params[:image][:y1].to_i * scale
    # x2 = params[:image][:x2].to_i * scale
    # y2 = params[:image][:y2].to_i * scale
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
    
    @image_file = localfile
    File.unlink testfile
    
    render :partial => 'crop_results_thumb'
  end
  
  def upload_feature_image
    @pg = CmsPage.find_by_id(params[:id])
    render :partial => 'upload_feature_image'
  end
  
  def crop_feature_image
    @pg = CmsPage.find_by_id(params[:id])
    localfile = File.basename(params[:filename])
    
    # get out now if user clicked finish
    if params[:next_clicked].to_i != 1
      @image_file = localfile
      render :partial => 'crop_results_feature_image' and return
    end
    
    
    # if we're still here... let's crop!
    target_dir = File.join(Rails.root, 'public', 'images', 'content', @pg.path)
    localfile = File.join(target_dir, localfile)
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
    target_dir = File.join(Rails.root, 'public', 'images', 'content', @pg.path)
    testfile = File.join(target_dir, File.basename(params[:filename]))
    localfile = testfile.split(/-croptest/).join('')
    
    # need to scale up requested position/dimensions based on how big test image
    # is relative to original image
    orig_im = MiniMagick::Image.from_file(localfile)
    test_im = MiniMagick::Image::from_file(testfile)
    scale = orig_im[:width].to_f / test_im[:width]
    
    x1 = params[:image][:x1].to_i * scale
    y1 = params[:image][:y1].to_i * scale
    # x2 = params[:image][:x2].to_i * scale
    # y2 = params[:image][:y2].to_i * scale
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
    
    @image_file = localfile
    File.unlink testfile
    
    render :partial => 'crop_results_feature_image'
  end
  
  
  private
  
  def load_page_objects
    @page_objects = HashObject.new
    @template_options = HashObject.new
    
    if @pg.new_record? && @parent
      # This does not appear to be a beneficial feature any longer
      # @tags = @parent.tags.collect { |t| t.name }.join(', ')
      @parent.objects.find(:all, :conditions => [ "obj_type = 'attribute'" ]).each do |obj|
        key = "obj-#{obj.obj_type.to_s}-#{obj.name}"
        @page_objects[key] = obj.content
      end
      @parent.objects.find(:all, :conditions => [ "obj_type = 'option'" ]).each do |obj|
        key = "obj-#{obj.obj_type.to_s}-#{obj.name}"
        @page_objects[key] = obj.content
      end
    else
      @tags = @pg.tags.collect { |t| t.name }.join(', ')
      @pg.objects.find(:all, :conditions => [ "obj_type = 'attribute'" ]).each do |obj|
        key = "obj-#{obj.obj_type.to_s}-#{obj.name}"
        @page_objects[key] = obj.content
      end
      @pg.objects.find(:all, :conditions => [ "obj_type = 'option'" ]).each do |obj|
        key = "obj-#{obj.obj_type.to_s}-#{obj.name}"
        @page_objects[key] = obj.content
      end
    end
  end
  
  def load_template_options
    begin
      render_to_string :inline => @pg.template.content
    rescue Exception => e
      logger.debug e
    end
  end
  
  def garbage_collect
    GC.start
  end
  
  def create_captions_file(pg_id, options = {})
    gallery_id = (!options[:gallery_id] ? params[:gallery_id] : options[:gallery_id])
    
    @pg = CmsPage.find_by_id(pg_id)
    galleries_dir = File.join(Rails.root, 'public', 'images', 'content', @pg.path)
    gallery_dir = File.join(galleries_dir, gallery_id)
    captions_location = File.join(gallery_dir, 'captions.yml')
    
    return if File.exists?(captions_location)
    
    File.open(captions_location, 'w') { |f| YAML.dump([0], f) }
  end
  
  # prerequisites: @pg (CmsPage)
  def load_gallery_settings_from_file(gallery_id, options = {})
    galleries_dir = File.join(Rails.root, 'public', 'images', 'content', @pg.path)
    gallery_dir = File.join(galleries_dir, gallery_id)
    settings_location = File.join(gallery_dir, 'settings.yml')
    
    ret = {}
    
    if File.exists?(settings_location)
      File.open(settings_location, 'r') { |f| ret = YAML.load(f.read) }
    else
      File.open(settings_location, 'w') { |f| YAML.dump({}, f) }
    end
    
    # set a few defaults
    ret[:slide_duration] ||= 0
    ret[:show_thumbs] ||= true
    
    return HashObject.new(ret)
  end
  
  # prerequisites: @pg (CmsPage)
  def save_gallery_settings_to_file(gallery_id, settings_hash, options = {})
    settings_hash = settings_hash.hash if settings_hash.kind_of?(HashObject)
    
    galleries_dir = File.join(Rails.root, 'public', 'images', 'content', @pg.path)
    gallery_dir = File.join(galleries_dir, gallery_id)
    settings_location = File.join(gallery_dir, 'settings.yml')
    
    File.open(settings_location, 'w') { |f| YAML.dump(settings_hash, f) }
  end
  
  def resize_image(localfile)
    ext = File.extname(localfile)
    
    # AKN: this would change all files to jpeg format... commenting out for now
    # filename = File.join(File.dirname(localfile), File.basename(localfile, ext) + '.jpg')
    filename = localfile
    
    im = MiniMagick::Image::from_file(localfile)
    
    if im[:width] > GalleryMaxWidth || im[:height] > GalleryMaxHeight
      im.resize("#{GalleryMaxWidth}x#{GalleryMaxHeight}")
      im.write(filename)
    elsif filename != localfile
      im.write(filename)
    end
    
    File.unlink(localfile) unless localfile == filename
    
    filename
  end
  
  def create_preview_image(src_file, dest, force = 0, overlay = 'gallery_small_overlay.png', thumb_size = 90)
    require 'RMagick'
    
    dest = File.join(dest, File.basename(src_file)) if File.directory?(dest)
    if !File.exists?(dest) || force == 1
      im = Magick::Image::read(src_file)[0]
      im_overlay = Magick::Image::read(File.join(Rails.root, 'public', 'images', 'management', overlay))[0]
      
      im.crop_resized!(thumb_size, thumb_size)
      im = im.composite(im_overlay, Magick::CenterGravity, Magick::OverCompositeOp)
      
      im.write(dest)
      File.chmod(0644, dest)
      
      im = im_overlay = nil
      GC.start
      
      nil
    end
  end
  
  def create_preview_images(options = {})
    # assumes @pg has already been set before calling
    
    galleries_dir = File.join(Rails.root, 'public', 'images', 'content', @pg.path)
    session[:broken_galleries] = []
    
    # create preview images if not already made
    Dir.glob("#{galleries_dir}/gallery_*").each do |g|
      begin
        management_dir = File.join(g, 'management')
        FileUtils.mkdir_p(management_dir) unless File.exists?(management_dir)
        
        images = Dir.glob("#{g}/*.{jpg,jpeg,png,gif}")
        preview_images = []
        images.each { |img| preview_images << img unless File.basename(img).include?('thumb') }
        
        # gallery preview image
        preview_image_location = File.join(management_dir, 'preview.jpg')
        unless File.exists?(preview_image_location)
          preview_image = preview_images.first
          create_preview_image(preview_image, preview_image_location, options[:force], 'gallery_preview_overlay.png', 130)
        end
        
        # photo preview images
        preview_images.each { |img| create_preview_image(img, management_dir, options[:force]) }
        
      rescue Exception => e
        # some error handling here
        session[:broken_galleries] << File.basename(g)
        
        log_error(e)
      end
    end
  end
  
end
