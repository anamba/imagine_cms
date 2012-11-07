class UtilController < ApplicationController # :nodoc:
  skip_before_filter :check_ssl_requirement
  
  def calendar
    @month = (params[:month] || Time.now.month).to_i
    @year = (params[:year] || Time.now.year).to_i
    first_of_month = Time.utc(@year, @month, 1)
    last_of_month = first_of_month.end_of_month
    
    @min_time = params[:min_time].to_i
    @max_time = params[:max_time].to_i
    @calendar = params[:calendar_id] ? Calendar.find(params[:calendar_id]) : Calendar.find(:first)
    @css_prefix = params[:css_prefix].to_s.gsub(/[^-\w]/, '')
    @popout_direction = params[:popout_direction]
    
    events = @calendar.events.find(:all, :conditions => [ 'start_date >= ? and start_date < ?', first_of_month, last_of_month + 1.day ])
    
    @event_days = {}
    events.each do |e|
      @event_days[e.start_date.mday] = e
    end
    
    render :update do |page|
      page.replace_html 'event_calendar_month_year', :partial => 'calendar_month_year'
      page.replace_html 'event_calendar_days', :partial => 'calendar_days'
    end
  end
  
  def date_picker
    @month = params[:month].to_i
    @year = params[:year].to_i
    @min_time = params[:min_time].to_i
    @max_time = params[:max_time].to_i
    @exclude_days = (params[:exclude_days] || '').split(',').map { |d| d.to_i }
    @object = params[:object]
    @method_prefix = params[:method_prefix]
    
    render :partial => 'date_picker'
  end
  
  def redirect_permanent
    redirect_to params[:path], :status => 301
  end
  
end
