#
# define constants related to configurable behaviors (change to proper config.imagine_cms.X later)
# for now, to override at the site-level:
#   Object.send(:remove_const, :UseCmsPageCaching)
#   UseCmsPageCaching = false
#

# Shouldn't need to adjust these
ContentIgnoreDirectories = [ '.svn', 'CVS' ] unless defined? ContentIgnoreDirectories
ContentIgnoreFilesRE = /^\./ unless defined? ContentIgnoreFilesRE
ContentExcludeFiles = [ 'index' ] unless defined? ContentExcludeFiles
UseCmsPageCaching = false unless defined? UseCmsPageCaching
# UseCmsPageDatabase = CmsPage.table_exists? unless defined? UseCmsPageDatabase
UseCmsAccessLevels = false unless defined? UseCmsAccessLevels
EnableAssetTimestamping = true unless defined? EnableAssetTimestamping

# CMS gallery setup
GalleryMaxWidth = 586 unless defined? GalleryMaxWidth
GalleryMaxHeight = 400 unless defined? GalleryMaxHeight
GalleryThumbWidth = 50 unless defined? GalleryThumbWidth
GalleryThumbHeight = 50 unless defined? GalleryThumbHeight

# SSL settings
SSL_REDIRECTS_ON = false unless defined?(SSL_REDIRECTS_ON)
SSL_STANDARD_HOST = 'localhost' unless defined?(SSL_STANDARD_HOST)
SSL_SECURE_HOST = '127.0.0.1' unless defined?(SSL_SECURE_HOST)
# if using non-standard ports, also set these:
# SSL_STANDARD_PORT = 80
# SSL_SECURE_PORT = 443

# Member component
Member_AllowEmailAsLogin = true unless defined? Member_AllowEmailAsLogin
Member_RequireMembername = false unless defined? Member_RequireMembername
