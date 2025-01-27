xml.instruct!
xml.rss :version => "2.0", 'xmlns:content' => "http://purl.org/rss/1.0/modules/content/" do
  xml.channel do
    xml.title params[:page_list_name]
    xml.link url_for(only_path: false,
                     controller: '/cms/content', action: 'show',
                     content_path: @pg.path.split('/'))
      xml.lastBuildDate CGI.rfc1123_date(@most_recent_pub_date ? @most_recent_pub_date.published_date : Time.now)
      xml.language "en-us"
      xml.description h(@pg.summary)
      @pages.each do |page|
        xml.item do
          xml.title page.title
          xml.link url_for(only_path: false,
                           controller: '/cms/content', action: 'show',
                           content_path: page.path.split('/'))
          xml.description strip_tags(@page_contents[page.id])
          xml.tag!('content:encoded') do
            xml.cdata! @page_contents[page.id]
          end
          xml.pubDate CGI.rfc1123_date(page.published_date)
          xml.guid url_for(only_path: false,
                           controller: '/cms/content', action: 'show',
                           content_path: page.path.split('/'))
      end
    end
  end
end
