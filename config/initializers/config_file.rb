config_file = File.join(Rails.root, 'config', 'imagine_cms.yml')

if File.exists?(config_file)
  ImagineCmsConfig = YAML.load(File.read(config_file))
  
  if ImagineCmsConfig['amazon_s3'] && ImagineCmsConfig['amazon_s3']['enabled']
    AWS::S3::Base.establish_connection!(
      :access_key_id     => ImagineCmsConfig['amazon_s3'][Rails.env]['access_key_id'],
      :secret_access_key => ImagineCmsConfig['amazon_s3'][Rails.env]['secret_access_key']
    )
  end
else
  ImagineCmsConfig = {}
end
