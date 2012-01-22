class HashObject
  attr_accessor :hash
  
  def initialize(hash = {})
    @hash = HashWithIndifferentAccess.new(hash)
  end
  
  def id            ; @hash['id']           ; end
  def id=(val)      ; @hash['id'] = val     ; end
  
  def [](key)       ; @hash[key.to_s]       ; end
  def []=(key, val) ; @hash[key.to_s] = val ; end
  
  def delete(key)   ; @hash.delete(key)     ; end
  
  def rename_key(key, new_key)
    @hash[new_key.to_s] = @hash[key]
    @hash.delete(key)
  end
  
  def each(&block)
    @hash.each { |k,v| yield(k,v) }
  end
  
  def method_missing(method_id, *args)
    key = method_id.id2name.to_s
    
    if key[-1, 1] == '='
      key.slice!(-1, 1)
      val = args.shift
      @hash[key] = val
    else
      @hash[key]
    end
  end
  
end