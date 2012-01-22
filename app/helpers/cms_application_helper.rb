module CmsApplicationHelper
  
  # Get an array of all times, useful in select's (5 minute interval by default)
  def all_times_array(interval = 5)
    a = []
    (0..23).each do |h|
      (0..59).each do |m|
        next unless m % interval == 0
        t = Time.mktime(2000, 1, 1, h, m)
        a << t.strftime("%I").to_i.to_s + t.strftime(":%M%p").downcase
      end
    end
    
    a
  end
  
  # Takes object_name and method_name as arguments (like other form helpers, such
  # as text_field) and returns html containing form_error.gif and form_loading.gif.
  # If there are no errors for the given field, form_error.gif is hidden using
  # style="display: none". If there are errors, form_error.gif is shown, and its
  # hover text lists the errors.
  def form_icons(object_name, method_name, options = {})
    object_name = object_name.to_s
    method_name = method_name.to_s
    
    ret = ''
    errors = []
    
    instance_variable_get("@#{object_name}").errors.each do |attr, msg|
      errors << msg if attr == method_name
    end
    
    options[:style] ||= ''
    
    if errors.size == 0
      options[:style] << 'display: none;'
    end
    
    ret << "<div id=\"#{object_name}_#{method_name}_error\" class=\"form-error\""
    ret << " style=\"#{options[:style]}\"" unless options[:style].blank?
    if errors.size > 0
      ret << " title=\"#{h errors.join('; ')}\""
    end
    ret << '><img src="/images/interface/form_error.gif" width="17" height="17" border="0" />'
    ret << '</div>'
    
    ret << "<div id=\"#{object_name}_#{method_name}_loading\" class=\"form-loading\" style=\"display: none;\">"
    ret << "<img src=\"/images/interface/form_loading.gif\" width=\"16\" height=\"16\" border=\"0\" style=\"margin: 0 1px 1px 0;\" />"
    ret << "</div>"
    
    if errors.size > 0 && options[:display_messages]
      options[:message_separator] ||= '<br/>'
      ret << "<div id=\"#{object_name}_#{method_name}_error_messages\" class=\"form-error-messages\">"
      ret << errors.join(options[:message_separator])
      ret << "</div>"
    end
    
    ret
  end
  
  def error_messages_for(object_name, options = {}) # :nodoc:
    options = options.symbolize_keys
    object = instance_variable_get("@#{object_name.to_s}")
    return '' unless object
    
    unless object.errors.empty?
      content_tag("div",
        content_tag("h3", "There were problems with the following fields:") +
        content_tag("ul", object.errors.full_messages.collect { |msg| content_tag("li", msg) }),
        "id" => options[:id] || "errorExplanation", "class" => options[:class] || "errorExplanation"
      )
    end
  end
  
  # Display any available flash messages (:error, :notice), 
  #
  # NOTE: @error and @notice are deprecated, use flash.now[:error] and flash.now[:notice] instead.
  def flash_message(message = 'Please review the following messages:')
    output = ''
    if (flash[:error] || @error || '') != ''
      output << "<p>#{message}</p>"
      output << "<p class=\"error\">#{flash[:error] || @error}</p>"
    end
    if (flash[:notice] || @notice || '') != ''
      output << "<p class=\"notice\">#{flash[:notice] || @notice}</p>"
    end
    output
  end
  
  # Similar to button_to, but takes a url for a button image as its first argument.
  def image_button_to(source, options = {}, html_options = {})
    html_options.stringify_keys!
    html_options[:type] = 'image'
    html_options[:src] = image_path(source)
    
    convert_boolean_attributes!(html_options, %w( disabled ))
    
    if confirm = html_options.delete("confirm")
      html_options["onclick"] = "return #{confirm_javascript_function(confirm)};"
    end
    
    url = options.is_a?(String) ? options : url_for(options)
    name ||= url
    
    "<form method=\"post\" action=\"#{h url}\" class=\"image-button-to\"><div>" +
      tag("input", html_options) + "</div></form>"
  end
  
  # Similar to submit_to_remote, but takes a url for a button image as its
  # first argument.
  def image_submit_to_remote(source, options = {})
    options[:with] ||= 'Form.serialize(this.form)'
    
    options[:html] ||= {}
    options[:html][:type] = 'image'
    options[:html][:onclick] = "#{remote_function(options)}; return false;"
    options[:html][:src] = image_path(source)
    
    tag("input", options[:html], false)
  end
  
  # Creates a mailto: link that is encoded to prevent most harvesting attempts.
  def encoded_mail_to(email, link_text = nil)
    url = ''
    text = ''
    email.length.times do |i|
      url << (i % 2 == 0 ? sprintf("%%%x", email[i]) : email[i])
      text << (i % 4 == 0 ? '<span>' << email[i] << '</span>' : email[i])
    end
    
    "<a href=\"mailto:#{url}\">#{link_text || text}</a>"
  end
  
  # Display a date picker with an ajax calendar.
  #
  # Options:
  # * :default_value => Time.now
  # * :start_date => '06/01/2006', :end_date => '05/31/2007'
  # * :exclude_days => [ :monday, :saturday, :sunday ]
  # * :blackout_ranges => [ ['06/04/2006', '06/18/2006'], ['08/16/2006', '09/01/2006'] ] (not implemented)
  #
  # TODOC: There are a number of somewhat complex prerequisites...
  def date_picker(object, method_prefix, options = {})
    object = object.to_s
    method_prefix = method_prefix.to_s
    
    # set some arbitrary but sensible limits for now...
    start_date = options[:start_date] || 5.years.ago
    start_date = Time.parse(start_date) if start_date.kind_of? String
    end_date   = options[:end_date] || 10.years.from_now
    end_date = Time.parse(end_date) if end_date.kind_of? String
    
    onchange = options[:onchange] || ''
    exclude_days = options[:exclude_days] || []
    min_year = start_date.year
    max_year = end_date.year
    
    
    exclude_days.map! do |d|
      case (d)
        when :sunday then 0
        when :monday then 1
        when :tuesday then 2
        when :wednesday then 3
        when :thursday then 4
        when :friday then 5
        when :saturday then 6
        else nil
      end
    end
    
    i = 0
    while exclude_days.include?(start_date.wday) && i < 7
      start_date += 1.day
      i += 1
    end
    
    default_value = options[:default_value] || (instance_variable_get("@#{object}").send(method_prefix) rescue nil)
    default_value = Time.parse(default_value) if default_value.is_a?(String)
    default_value ||= start_date
    
    draw_calendar = "new Ajax.Updater('date_picker_#{object}_#{method_prefix}_days', '" + date_picker_url + "?" +
                    "month=' + $('#{object}_#{method_prefix}_month_sel').value + " +
                    "'&year=' + $('#{object}_#{method_prefix}_year_sel').value + " +
                    "'&min_time=' + #{start_date.to_i} + " +
                    "'&max_time=' + #{end_date.to_i} + " +
                    "'&exclude_days=#{exclude_days.join(',')}' + " +
                    "'&onchange=#{escape_javascript(options[:onchange])}' + " +
                    "'&object=#{object}' + " +
                    "'&method_prefix=#{method_prefix}', {asynchronous:true, evalScripts:true})"
    
    ret = <<EOF
  <span><a href="#" onclick="showDatePicker('#{object}', '#{method_prefix}'); return false;"><span id="date_picker_#{object}_#{method_prefix}_value">#{default_value.strftime('%a %m/%d/%y')}</span></a></span>
  <span id="date_picker_#{object}_#{method_prefix}icon"><a href="#" onclick="showDatePicker('#{object}', '#{method_prefix}'); return false;"><img src="/images/interface/icon_time.gif" style="float: none" alt="date picker" /></a></span>
  <div id="date_picker_#{object}_#{method_prefix}main" style="display: none; background-color: white; border: 1px solid gray; padding: 3px; z-index: 101;" class="date-picker-main">
    <table width="190">
      <tr>
        <td><a href="#" onclick="dpPrevMonth('#{object}', '#{method_prefix}', #{min_year}); #{h(draw_calendar)}; return false;"><img src="/images/interface/arrow_previous.gif" border="0" alt="Previous" style="float: left; padding: 2px 0 0 6px; margin: 0;" /></a></td>
        <td colspan="5" align="center">
          <nobr>
          #{ select_tag object + '_' + method_prefix + '_month_sel', options_for_select(months_hash, default_value.month.to_s), :class => 'form', :style => 'border: 1px solid gray; font-size: 11px; padding: 0; margin: 0;', :onchange => h(draw_calendar) }
          #{ select_tag object + '_' + method_prefix + '_year_sel', options_for_select((min_year..max_year).to_a, default_value.year), :class => 'form', :style => 'border: 1px solid gray; font-size: 11px; padding: 0; margin: 0;', :onchange => h(draw_calendar) }
          </nobr>
        </td>
        <td><a href="#" onclick="dpNextMonth('#{object}', '#{method_prefix}', '#{max_year}'); #{h(draw_calendar)}; return false;"><img src="/images/interface/arrow_next.gif" border="0" alt="Next" style="float: right; padding: 2px 6px 0 0; margin: 0;" /></a></td>
      </tr>
    </table>
    <div id="date_picker_#{object}_#{method_prefix}_days" class="date-picker-days"></div>
    #{ text_field object, method_prefix + '_year', :value => default_value.year, :style => 'display: none;' }
    #{ text_field object, method_prefix + '_month', :value => default_value.month, :style => 'display: none;' }
    #{ text_field object, method_prefix + '_day', :value => default_value.day, :style => 'display: none;' }
    <div style="width: 100%;" align="center" class="date-picker-close">
        <a href="#" onclick="hideDatePicker('#{object}', '#{method_prefix}'); return false;">Close</a>
    </div>
  </div>
EOF
    ret += javascript_tag(draw_calendar)
  end
  
  # Display a clickable ajax event calendar.
  #
  # Options:
  # * :start_date => '06/01/2006', :end_date => '05/31/2007'
  # * :show_selects => true (default :false)
  # * :calendar_id => 1
  # * :css_prefix => 'calendar_'
  #
  # TODOC: There are a number of somewhat complex prerequisites...
  def event_calendar(options = {})
    start_date = options[:start_date] || Time.now
    end_date   = options[:end_date] || 1.year.from_now
    start_date = Time.parse(start_date) if start_date.is_a? String
    end_date = Time.parse(end_date) if end_date.is_a? String
    
    onchange = options[:onchange] || ''
    min_year = start_date.year
    max_year = min_year + 5
    
    calendar_id = options[:calendar_id] || Calendar.find_first.id
    
    css_prefix = options[:css_prefix] || 'calendar_'
    popout_direction = options[:popout_direction] || :right
    
    draw_calendar = "var ta = $('event_calendar_events_' + " +
                    "$('event_calendar_month_sel').value + '_' + $('event_calendar_year_sel').value); " +
                    "new Ajax.Request(" +
                    "'#{url_for :controller => "/util", :action => "calendar" }?" +
                    "month=' + $('event_calendar_month_sel').value + " +
                    "'&year=' + $('event_calendar_year_sel').value + " +
                    "'&min_time=#{start_date.to_i}&max_time=#{end_date.to_i}" +
                    "&calendar_id=#{calendar_id}&css_prefix=#{css_prefix}" +
                    "&popout_direction=#{popout_direction.to_s}', {asynchronous:true, evalScripts:true})"
    
    # keep all this junk in sync with what's in UtilController
    @month = Time.now.month
    @year = Time.now.year
    @min_time = start_date.to_i
    @max_time = end_date.to_i
    @calendar = Calendar.find(calendar_id)
    @css_prefix = css_prefix
    @popout_direction = popout_direction
    
    first_of_month = Time.mktime(@year, @month, 1)
    last_of_month = first_of_month.end_of_month
    events = @calendar.events.find(:all, :conditions => [ 'start_date >= ? and start_date <= ?', first_of_month, last_of_month ])
      
    @event_days = {}
    events.each do |e|
      @event_days[e.start_date.mday] = e
    end
    
    ret = <<EOF
  <table id="event_calendar" class="#{css_prefix}container" cellspacing="0" cellpadding="0" border="0">
    <tr class="#{css_prefix}container">
      <td class="#{css_prefix}container">
        <table class="#{css_prefix}head" cellspacing="0" cellpadding="0" border="0">
          <tr class="#{css_prefix}head">
            <td class="#{css_prefix}head #{css_prefix}head_prev_month"><a href="#" onclick="dpPrevMonth('event', 'calendar', #{min_year}); #{draw_calendar}; return false;"><img src="/images/interface/arrow_previous.gif" border="0" alt="Previous" style="float: left; padding-left: 2px;" /></a></td>
            <td class="#{css_prefix}head #{css_prefix}head_month_select">
              <div#{options[:show_selects] ? '' : ' style="display: none"'}>
                #{ select 'event_calendar', 'month_sel', months_hash, { :selected => Time.now.month.to_s }, :class => 'form', :style => 'font-size: 11px;', :onchange => draw_calendar }
                #{ select 'event_calendar', 'year_sel', (min_year..max_year).to_a, { :selected => Time.now.year }, :class => 'form', :style => 'font-size: 11px;', :onchange => draw_calendar }
              </div>
              <div id="event_calendar_month_year"#{options[:show_selects] ? ' style="display: none"' : ''}>
                #{render '/util/_calendar_month_year'}
              </div>
            </td>
            <td class="#{css_prefix}head #{css_prefix}head_next_month"><a href="#" onclick="dpNextMonth('event', 'calendar', '#{max_year}'); #{draw_calendar}; return false;"><img src="/images/interface/arrow_next.gif" border="0" alt="Next" style="float: right; padding-right: 2px;" /></a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr class="#{css_prefix}container">
      <td class="#{css_prefix}container">
        <div id="event_calendar_days" class="#{css_prefix}container #{css_prefix}container_days">
          #{render '/util/_calendar_days'}
        </div>
      </td>
    </tr>
  </table>
EOF
    ret += javascript_tag(draw_calendar)
  end
  
  def product_browser(object, method, options = {}) # :nodoc:
    # allowed options, with defaults:
    #  - :can_select_department => false
    #  - :can_select category => false
    #  - :allow_multiple => false    # not implemented
    #  - :offset_x => 0, :offset_y => 0
    #
    # Note that allowing dept and category will cause this helper to create multiple
    # input fields, called object_method_department_id and object_method_category_id.
    # It is your job to figure out which one is not blank and use that return value.
    # Similarly, with allow multiple, you will need to parse the comma-separated list
    # of ids yourself.
    
    object = object.to_s
    method = method.to_s
    
    object_name = self.instance_variable_get('@' + object).send(method + '_object_name')
    object_name = 'Select' if (object_name || '') == ''
    
    ret = <<EOF
  <a href="#" onclick="if (cbBrowserVisible) { cbHideBrowser(); } else { cbShowBrowser('#{object}', '#{method}', #{options[:offset_x] || 0}, #{options[:offset_y] || 0}); #{remote_function(:update => 'columnBrowserLevel0', :url => { :controller => '/management/bcom/products', :action => 'list_departments', :mode => 'select' })}; } return false;"><span id="#{object}_#{method}_link">#{object_name}</span></a>
  <div id="#{object}_#{method}_container" style="display: none"></div>
  <div style="display: none">
    #{text_field object, method + '_object_name'}
    #{text_field object, method + '_department_id'}
    #{text_field object, method + '_category_id'}
    #{text_field object, method + '_product_id'}
    #{text_field object, method + '_product_option_id'}
    #{text_field object, method + '_object_name_temp'}
    #{text_field object, method + '_department_id_temp'}
    #{text_field object, method + '_category_id_temp'}
    #{text_field object, method + '_product_id_temp'}
    #{text_field object, method + '_product_option_id_temp'}
  </div>
EOF
    return ret
  end
  
  # Note that this currently won't work for > 100 options
  def ordered_hash(input) # :nodoc:
    ret = Hash.new
    i = 0
    for k in input
      ret[k[0]] = (i < 10 ? '0' + i.to_s : i.to_s) + k[1]
      i += 1
    end
    ret.sort { |a,b| a[1] <=> b[1] }.map { |a| a[1].slice!(0...2) ; a }
  end
  
  # Returns an array of arrays (no, it is not named particularly well) containing the 50 US
  # states and their abbreviations. Pass true as first arg to enable territories, etc. Intended
  # for use with the select form helper.
  def us_states_hash(include_territories = false)
    states_plus_dc = {
      "Alabama" => 'AL', "Alaska" => 'AK', "Arizona" => 'AZ', "Arkansas" => 'AR',
      "California" => 'CA', "Colorado" => 'CO', "Connecticut" => 'CT',
      "Delaware" => 'DE', "District Of Columbia" => 'DC',
      "Florida" => 'FL',
      "Georgia" => 'GA',
      "Hawaii" => 'HI',
      "Idaho" => 'ID', "Illinois" => 'IL', "Indiana" => 'IN', "Iowa" => 'IA',
      "Kansas" => 'KS', "Kentucky" => 'KY',
      "Louisiana" => 'LA',
      "Maine" => 'ME', "Maryland" => 'MD', "Massachusetts" => 'MA', "Michigan" => 'MI',
      "Minnesota" => 'MN', "Mississippi" => 'MS', "Missouri" => 'MO', "Montana" => 'MT',
      "Nebraska" => 'NE', "Nevada" => 'NV', "New Hampshire" => 'NH', "New Jersey" => 'NJ',
      "New Mexico" => 'NM', "New York" => 'NY', "North Carolina" => 'NC', "North Dakota" => 'ND',
      "Ohio" => 'OH', "Oklahoma" => 'OK', "Oregon" => 'OR',
      "Pennsylvania" => 'PA',  
      "Rhode Island" => 'RI',
      "South Carolina" => 'SC', "South Dakota" => 'SD',
      "Tennessee" => 'TN', "Texas" => 'TX',
      "Utah" => 'UT',
      "Vermont" => 'VT', "Virginia"=>'VA',
      "Washington" => 'WA', "West Virginia" => 'WV', "Wisconsin" => 'WI', "Wyoming" => 'WY'
    }
    
    territories_etc = {
      "Armed Forces Americas" => 'AA',
      "Armed Forces Europe, Middle East, Africa and Canada" => 'AE',
      "Armed Forces Pacific" => 'AP',
      "American Samoa" => 'AS',
      "Federated States of Micronesia" => 'FM',
      "Guam" => 'GU',
      "Marshall Islands" => 'MH',
      "Northern Mariana Islands" => 'MP',
      "Palau" => 'PW',
      "Puerto Rico" => 'PR',
      "Virgin Islands" => 'VI'
    }
    
    (include_territories ? states_plus_dc.merge(territories_etc) : states_plus_dc).to_a.sort { |a,b| a.last <=> b.last }
  end
  
  # Returns a hash containing the months of the year. Intended for use with the
  # select form helper.
  def months_hash
    { 'January' => '1', 'February' => '2', 'March' => '3', 'April' => '4',
      'May' => '5', 'June' => '6', 'July' => '7', 'August' => '8',
      'September' => '9', 'October' => '10', 'November' => '11',
      'December' => '12' }.sort{ |a, b| a.last.to_i <=> b.last.to_i }
  end
  
  # Returns a hash containing the 3-character abbreviations of the months of
  # the year. Intended for use with the select form helper.
  def short_months_hash
    { 'Jan' => '1', 'Feb' => '2', 'Mar' => '3', 'Apr' => '4', 'May' => '5',
      'Jun' => '6', 'Jul' => '7', 'Aug' => '8', 'Sep' => '9', 'Oct' => '10',
      'Nov' => '11', 'Dec' => '12' }.sort{ |a, b| a.last.to_i <=> b.last.to_i }
  end
  
  
  def cropper_image_tag(options)
    ret = image_tag(options[:url] || '', :id => "testImage")
    ret += javascript_tag "cropper = new Cropper.Img('testImage', { minWidth: 0, minHeight: 0, captureKeys: false, onEndCrop: onEndCrop });"
  end
  
  def page_image_tag(page, filename)
    image_tag File.join('content', page.path, File.basename(filename))
  end
  
  def copyright_year(year)
    year_str, this_year = year.to_s, Time.now.year.to_s
    year_str << "&ndash;#{this_year}" if ((year_str.to_i.to_s == year_str) and (year_str.to_i != this_year.to_i))
    year_str
  end
  
end
