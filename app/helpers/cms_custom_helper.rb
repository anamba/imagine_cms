module CmsCustomHelper
  # override this method to do your own custom subtitutions
  def substitute_placeholders_custom(temp, _page)
    # an example:
    # begin
    #   temp.gsub!(/<#\s*upcoming_event_date\s*#>/, page.article_date.strftime("<span class=\"month\">%b</span><span class=\"day\">%d</span>"))
    # rescue
    # end

    # remember to return your modified copy of temp
    temp
  end
end
