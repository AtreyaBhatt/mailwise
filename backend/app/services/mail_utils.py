import imaplib
import email
from email.header import decode_header
from typing import List, Dict

class EmailRetriever:
    def __init__(self, email_address: str, password: str, imap_server: str = "imap.gmail.com"):
        self.email_address = email_address
        self.password = password
        self.imap_server = imap_server
        self.connection = None

    def connect(self):
        self.connection = imaplib.IMAP4_SSL(self.imap_server)
        self.connection.login(self.email_address, self.password)
        self.connection.select("INBOX")

    def fetch_emails(self, limit: int = 10) -> List[Dict]:
        status, messages = self.connection.search(None, "ALL")
        email_ids = messages[0].split()
        email_ids = email_ids[-limit:]
        emails = []

        for e_id in reversed(email_ids):
            status, msg_data = self.connection.fetch(e_id, "(RFC822)")
            if status != 'OK':
                continue
            raw_email = msg_data[0][1]
            msg = email.message_from_bytes(raw_email)

            subject = self._decode_header(msg.get("Subject"))
            sender = self._decode_header(msg.get("From"))
            body = self._get_body(msg)

            emails.append({
                "id": e_id.decode(),
                "subject": subject,
                "sender": sender,
                "body": body
            })
        return emails

    def _decode_header(self, header_value):
        if header_value:
            decoded_parts = decode_header(header_value)
            decoded_string = ""
            for part, encoding in decoded_parts:
                if isinstance(part, bytes):
                    decoded_string += part.decode(encoding or "utf-8", errors="ignore")
                else:
                    decoded_string += part
            return decoded_string
        return ""

    def _get_body(self, msg):
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition"))
                if content_type == "text/plain" and "attachment" not in content_disposition:
                    try:
                        return part.get_payload(decode=True).decode()
                    except:
                        return ""
        else:
            try:
                return msg.get_payload(decode=True).decode()
            except:
                return ""
        return ""

    def close(self):
        if self.connection:
            self.connection.close()
            self.connection.logout()
