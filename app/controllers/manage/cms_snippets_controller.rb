class Manage::CmsSnippetsController < Manage::ApplicationController
  before_action :check_permissions
  before_action :block_basic_users
  
  cache_sweeper :cms_content_sweeper
  
  def index
    @cms_snippets = CmsSnippet.order(:name)
  end

  def new
    @cms_snippet = CmsSnippet.new
    render action: 'edit'
  end

  def create
    @cms_snippet = CmsSnippet.new
    @cms_snippet.assign_attributes(cms_snippet_params)
    
    begin
      @pg = CmsPage.new
      @page_objects = OpenStruct.new
      render_to_string inline: @cms_snippet.content
    rescue StandardError => e
      message = e.message
      flash.now[:error] = "<pre>#{ERB::Util.html_escape(message)}</pre>".html_safe
      logger.debug e
      render action: 'edit' and return
    end
    
    if !@cms_snippet.save
      flash.now[:error] = @cms_snippet.errors.full_messages.join('<br>').html_safe
      render action: 'edit'
    else
      flash[:notice] = 'Snippet created.'
      redirect_to action: 'edit', id: @cms_snippet.id
    end
  end
  
  def edit
    @cms_snippet = CmsSnippet.find_by_id(params[:id])
  end
  
  def update
    @cms_snippet = CmsSnippet.find(params[:id])
    @cms_snippet.assign_attributes(cms_snippet_params)
    
    begin
      @pg = CmsPage.new
      @page_objects = OpenStruct.new
      render_to_string inline: @cms_snippet.content
    rescue StandardError => e
      message = e.message
      flash.now[:error] = "<pre>#{ERB::Util.html_escape(message)}</pre>".html_safe
      logger.debug e
      render action: 'edit' and return
    end
    
    if !@cms_snippet.save
      flash.now[:error] = @cms_snippet.errors.full_messages.join('<br>').html_safe
      render action: 'edit'
    else
      flash[:notice] = 'Snippet saved.'
      redirect_to action: 'edit', id: @cms_snippet
    end
  end

  protected

    def check_permissions
      if !user_has_permission?(:manage_cms)
        render '/imagine_cms/errors/permission_denied', layout: false
        return false
      end
    end

    def block_basic_users
      return true unless UseCmsAccessLevels
      unless user_has_permission?(:manage_cms_full_access)
        render '/imagine_cms/errors/permission_denied'
        return false
      end
    end

    def cms_snippet_params
      params.require(:cms_snippet).permit(:name, :content)
    end

end
