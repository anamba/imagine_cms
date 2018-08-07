class Manage::CmsTemplatesController < Manage::ApplicationController
  before_action :check_permissions
  before_action :block_basic_users

  cache_sweeper :cms_content_sweeper
  
  def index
    @cms_templates = CmsTemplate.order(:name)
  end

  def new
    @cms_template = CmsTemplate.new
    render action: 'edit'
  end
  
  def create
    @cms_template = CmsTemplate.new
    update
  end

  def edit
    @cms_template = CmsTemplate.find(params[:id])
  end

  def update
    @cms_template ||= CmsTemplate.find(params[:id])
    @cms_template.assign_attributes(cms_template_params)
    
    begin
      puts Cms::ContentController.renderer.new('action_dispatch.request.path_parameters' => {
        controller: '/cms/content', action: 'show', id: @cms_template.pages.last || CmsPage.new }).render inline: @cms_template.content
    rescue ScriptError, StandardError => e
      flash.now[:error] = "<pre title=\"#{ERB::Util.html_escape(e.backtrace.join("\n"))}\">#{ERB::Util.html_escape(e.message)}</pre>".html_safe
      render action: 'edit' and return
    end
    
    # this must come after the render_to_string so that we capture template
    # options embedded in snippets
    @cms_template.options = @cms_templatelate_options
    
    if !@cms_template.save
      flash.now[:error] = @cms_template.errors.full_messages.join('<br>').html_safe
      render action: 'edit'
    else
      flash[:notice] = 'Template saved.'
      redirect_to action: 'edit', id: @cms_template.id
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

    def cms_template_params
      params.require(:cms_template).permit(:name, :content)
    end
    
end