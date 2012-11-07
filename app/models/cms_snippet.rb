class CmsSnippet < ActiveRecord::Base
  acts_as_versioned
  
  attr_accessible :name, :content
  
  def content=(value)
    if value && value.is_a?(String)
      # filter suspicious content... go overboard for now, fine-tune later perhaps
      value.gsub!(/<(%.*?(exec|system)\s?\(.*?\s*%)>/, '&lt;\1&gt;')
      value.gsub!(/<(%.*?\%x\s?\[.*?\s*%)>/, '&lt;\1&gt;')
      value.gsub!(/<(%.*?`.*?\s*%)>/, '&lt;\1&gt;')
    end
    super(value)
  end
  
end
