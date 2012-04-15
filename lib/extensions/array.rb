require 'active_support/core_ext/string/output_safety'
require 'active_support/core_ext/module/aliasing.rb'

class Array
  def safe_join(sep = $,)
    sep ||= "".html_safe
    sep = ERB::Util.html_escape(sep)
    
    map { |i| ERB::Util.html_escape(i) }.join(sep).html_safe
  end
end
