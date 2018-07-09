class ImagineCmsMailer < ActionMailer::Base
  
  def request_review(page_url, page_title, page_version, recipient, sender, change_description)
    @page_url = page_url
    @page_title = page_title
    @page_version = page_version
    @recipient = recipient
    @sender = sender
    @change_description = change_description
    
    mail(to: recipient.email_address, reply_to: (sender.email_address.blank? ? nil : sender.email_address),
         from: "#{sender.first_name} #{sender.last_name} <#{CmsRequestReviewEmailSender}>",
         subject: "Request for web site update review")
  end
  
end
