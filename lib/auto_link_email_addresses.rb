module ActionView::Helpers::TextHelper
  
  # Turns all email addresses into clickable links.  If a block is given,
  # each email is yielded and the result is used as the link text.
  # Example:
  #   auto_link_email_addresses(post.body) do |text|
  #     truncate(text, 15)
  #   end
  def auto_link_email_addresses(content)
    re = %r{
            (<\w+[^\<\>]*?\>|[\s[:punct:]]|mailto:|^) # leading text
            (
              [\w\.\!\#\$\%\-\+\.\/]+                 # username
              \@
              [-\w]+                                  # subdomain or domain
              (?:\.[-\w]+)+                           # remaining subdomains or domain
            ) 
            ([[:punct:]]|\s|\<|$)                     # trailing text
           }x
    
    content.gsub(re) do |all|
      # this seems incredibly stupid, but $1, $2, $3 weren't being set
      re.match(all)
      
      a, b, c = $1, $2, $3
      
      if a =~ /\<a\s|[='"]$/i
        all
      elsif a =~ /mailto:/i
        url_src = b
        
        url = ''
        url_src.length.times do |i|
          url << (i % 2 == 0 ? sprintf("%%%x", url_src[i].ord) : url_src[i])
        end
        
        "#{a}#{url}#{c}"
      else
        url_src = b
        text_src = b
        text_src = yield(text_src) if block_given?
        
        unless url_src && text_src
          all
        else
          url = ''
          text = ''
          url_src.length.times do |i|
            url << (i % 2 == 0 ? sprintf("%%%x", url_src[i].ord) : url_src[i])
          end
          text_src.length.times do |i|
            text << (i % 4 == 0 ? '<span>' << text_src[i] << '</span>' : text_src[i])
          end
          
          "#{a}<a href=\"mailto:#{url}\">#{text}</a>#{c}"
        end
      end
    end.html_safe
  end
  
end