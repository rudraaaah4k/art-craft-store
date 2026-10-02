/**
 * Centralised notification helper (Phase 6a).
 * All notification logic lives here so trigger-points stay thin.
 * Email uses the configured provider (Resend or mock).
 * WhatsApp is a stub interface only — will be wired to a real BSP later.
 */
import { getEmailProvider } from '@/lib/providers/email'
import { getWhatsAppProvider } from '@/lib/providers/whatsapp'

export type OrderNotificationEvent =
  | 'ORDER_CONFIRMED'
  | 'ORDER_SHIPPED'
  | 'ORDER_OUT_FOR_DELIVERY'
  | 'ORDER_DELIVERED'

interface OrderNotificationInput {
  event: OrderNotificationEvent
  orderId: string
  email: string
  phone?: string | null
  trackingNumber?: string | null
}

function buildEmail(input: OrderNotificationInput): { subject: string; text: string; html: string } {
  const id = input.orderId
  switch (input.event) {
    case 'ORDER_CONFIRMED':
      return {
        subject: `Order Confirmed – #${id}`,
        text: `Thank you! Your order #${id} has been confirmed and is being prepared. We'll notify you once it ships.`,
        html: `<p>Thank you! Your order <strong>#${id}</strong> has been confirmed and is being prepared.</p><p>We'll notify you once it ships.</p>`,
      }
    case 'ORDER_SHIPPED':
      return {
        subject: `Your Order Has Shipped – #${id}`,
        text: `Great news! Order #${id} is on its way.${input.trackingNumber ? ` Tracking: ${input.trackingNumber}` : ''}`,
        html: `<p>Great news! Order <strong>#${id}</strong> is on its way.${input.trackingNumber ? ` Tracking number: <strong>${input.trackingNumber}</strong>` : ''}</p>`,
      }
    case 'ORDER_OUT_FOR_DELIVERY':
      return {
        subject: `Out for Delivery – #${id}`,
        text: `Your order #${id} is out for delivery today. Please be available to receive it.`,
        html: `<p>Your order <strong>#${id}</strong> is out for delivery today. Please be available to receive it.</p>`,
      }
    case 'ORDER_DELIVERED':
      return {
        subject: `Order Delivered – #${id}`,
        text: `Your order #${id} has been delivered. We hope you love it! If you'd like to leave a review, visit your account page.`,
        html: `<p>Your order <strong>#${id}</strong> has been delivered. We hope you love it!</p><p>Visit your account to leave a review.</p>`,
      }
  }
}

function whatsappTemplate(event: OrderNotificationEvent): string {
  const templates: Record<OrderNotificationEvent, string> = {
    ORDER_CONFIRMED: 'order_confirmed',
    ORDER_SHIPPED: 'order_shipped',
    ORDER_OUT_FOR_DELIVERY: 'order_out_for_delivery',
    ORDER_DELIVERED: 'order_delivered',
  }
  return templates[event]
}

/**
 * Send order lifecycle notification via email + WhatsApp stub.
 * Never throws — notification failures must not break the order flow.
 */
export async function sendOrderNotification(input: OrderNotificationInput): Promise<void> {
  const emailContent = buildEmail(input)
  const emailPromise = getEmailProvider()
    .sendMessage({ to: input.email, ...emailContent })
    .catch((err: unknown) => {
      console.error('[notifications] email error', input.event, err)
    })

  const waPromise = input.phone
    ? getWhatsAppProvider()
        .sendMessage({
          to: input.phone,
          template: whatsappTemplate(input.event),
          variables: {
            order_id: input.orderId,
            ...(input.trackingNumber ? { tracking_number: input.trackingNumber } : {}),
          },
        })
        .catch((err: unknown) => {
          console.error('[notifications] whatsapp error', input.event, err)
        })
    : Promise.resolve()

  await Promise.all([emailPromise, waPromise])
}
