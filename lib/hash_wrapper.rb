class HashWrapper < Hash
  
  def init(hash, key)
    @hash = hash
    @key = key
    @hash[@key] ||= Hash.new
  end
  
  def [](subkey)
    @hash[@key][subkey]
  end
  
  def []=(subkey, obj)
    @hash[@key][subkey] = obj
  end
  
end
