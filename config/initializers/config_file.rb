config_file = File.join(Rails.root, 'config', 'imagine_cms.yml')

if File.exist?(config_file)
  ImagineCmsConfig = YAML.load(File.read(config_file))
  
  if ImagineCmsConfig['amazon_s3'] && ImagineCmsConfig['amazon_s3']['enabled']
    Aws.config[:s3] = { region: ImagineCmsConfig['amazon_s3']['region'] || 'us-east-1' }
    Aws.config[:credentials] = Aws::Credentials.new(ImagineCmsConfig['amazon_s3'][Rails.env]['access_key_id'],
                                                     ImagineCmsConfig['amazon_s3'][Rails.env]['secret_access_key'])
  end
else
  ImagineCmsConfig = {}
end
