class CmsTemplate < ActiveRecord::Base
  acts_as_versioned
  
  attr_accessor :options
  
  has_many :pages, :class_name => 'CmsPage'
  
  def after_find
    require 'yaml'
    @options = YAML.load(self.options_yaml) if self.options_yaml
  end
  
  def content=(value)
    if value && value.is_a?(String)
      # filter suspicious content... go overboard for now, fine-tune later perhaps
      value.gsub!(/<(%.*?(exec|system)\s?\(.*?\s*%)>/, '&lt;\1&gt;')
      value.gsub!(/<(%.*?\%x\s?\[.*?\s*%)>/, '&lt;\1&gt;')
      value.gsub!(/<(%.*?`.*?\s*%)>/, '&lt;\1&gt;')
    end
    super(value)
  end
  
  def before_save
    require 'yaml'
    self.options_yaml = YAML.dump(@options)
  end
  
end
