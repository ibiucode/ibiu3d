import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from config import (
    MAIL_ENABLED, MAIL_HOST, MAIL_PORT,
    MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM, MAIL_FROM_NAME, MAIL_ADMIN_TO,
)

logger = logging.getLogger(__name__)

SERVICE_LABELS = {
    'fdm': 'FDM 熔融堆積列印',
    'sla': 'SLA 光固化列印',
    'unsure': '不確定（請建議）',
}

BUDGET_LABELS = {
    'under500': 'NT$500 以下',
    '500-2000': 'NT$500 – 2,000',
    '2000-5000': 'NT$2,000 – 5,000',
    'over5000': 'NT$5,000 以上',
    'unsure': '不確定',
}


def _send(to: str, subject: str, html: str) -> None:
    if not MAIL_ENABLED:
        logger.info(f"[email] MAIL_ENABLED=false，略過發送 to={to} subject={subject}")
        return
    if not MAIL_USERNAME or not MAIL_PASSWORD:
        logger.warning("[email] MAIL_USERNAME/PASSWORD 未設定，略過發送")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{MAIL_FROM_NAME} <{MAIL_FROM}>"
    msg["To"] = to
    msg.attach(MIMEText(html, "html", "utf-8"))

    try:
        with smtplib.SMTP(MAIL_HOST, MAIL_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.sendmail(MAIL_FROM, to, msg.as_string())
        logger.info(f"[email] 已發送：to={to} subject={subject}")
    except Exception as e:
        logger.error(f"[email] 發送失敗：{e}")


def notify_admin(inquiry) -> None:
    """新詢價通知 → 管理員"""
    service = SERVICE_LABELS.get(inquiry.service_type or '', inquiry.service_type or '—')
    budget = BUDGET_LABELS.get(inquiry.budget or '', inquiry.budget or '—')

    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
      <div style="background:#f97316;padding:20px 24px;border-radius:8px 8px 0 0">
        <h2 style="color:#fff;margin:0;font-size:18px">▲ 職人自造 — 新詢價通知</h2>
      </div>
      <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
        <p style="margin:0 0 16px;color:#374151">收到一筆新詢價，請盡快回覆：</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr style="border-bottom:1px solid #e5e7eb">
            <td style="padding:10px 0;color:#6b7280;width:120px">客戶姓名</td>
            <td style="padding:10px 0;font-weight:600">{inquiry.customer_name}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb">
            <td style="padding:10px 0;color:#6b7280">Email</td>
            <td style="padding:10px 0">{inquiry.email or '—'}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb">
            <td style="padding:10px 0;color:#6b7280">電話</td>
            <td style="padding:10px 0">{inquiry.phone or '—'}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb">
            <td style="padding:10px 0;color:#6b7280">列印技術</td>
            <td style="padding:10px 0">{service}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb">
            <td style="padding:10px 0;color:#6b7280">預算</td>
            <td style="padding:10px 0">{budget}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#6b7280;vertical-align:top">需求說明</td>
            <td style="padding:10px 0;white-space:pre-wrap">{inquiry.customer_note or '—'}</td>
          </tr>
        </table>
        <div style="margin-top:20px;padding:12px 16px;background:#fff3cd;border-radius:6px;font-size:13px;color:#92400e">
          詢價單 ID：#{inquiry.id} ｜ 送出時間：{inquiry.created_at.strftime('%Y-%m-%d %H:%M')}
        </div>
      </div>
    </div>
    """
    _send(MAIL_ADMIN_TO, f"【新詢價 #{inquiry.id}】{inquiry.customer_name}", html)


def confirm_customer(inquiry) -> None:
    """收件確認信 → 客戶"""
    if not inquiry.email:
        return
    service = SERVICE_LABELS.get(inquiry.service_type or '', inquiry.service_type or '—')

    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
      <div style="background:#18181b;padding:20px 24px;border-radius:8px 8px 0 0;display:flex;align-items:center;gap:8px">
        <span style="color:#f97316;font-size:20px;font-weight:900">▲</span>
        <h2 style="color:#fff;margin:0;font-size:18px">職人自造</h2>
      </div>
      <div style="background:#f9fafb;padding:28px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
        <h3 style="margin:0 0 8px;font-size:20px">感謝您的詢價，{inquiry.customer_name} ！</h3>
        <p style="color:#6b7280;margin:0 0 20px;font-size:14px">
          您的需求已收到，我們將在 <strong style="color:#f97316">24 小時內</strong>以 Email 回覆詳細報價。
        </p>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;font-size:14px">
          <p style="margin:0 0 8px;font-weight:600;color:#374151">您的詢價摘要</p>
          <p style="margin:4px 0;color:#6b7280">列印技術：{service}</p>
          {"<p style='margin:4px 0;color:#6b7280'>需求說明：" + (inquiry.customer_note or '—') + "</p>" if inquiry.customer_note else ""}
        </div>
        <p style="margin:20px 0 0;font-size:13px;color:#9ca3af">
          若有急件需求，也可直接致電或透過 LINE 聯絡我們。<br>
          此信為系統自動寄出，請勿直接回覆。
        </p>
      </div>
    </div>
    """
    _send(inquiry.email, "【職人自造】已收到您的詢價，24 小時內回覆", html)
