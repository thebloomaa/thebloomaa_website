/**
 * Mock Notification Service
 * In production, this would integrate with Twilio/WhatsApp Business API or Firebase Cloud Messaging.
 */

export const NotificationService = {
  /**
   * Send a WhatsApp message to the customer
   */
  async sendWhatsApp(phone: string, template: string, variables: Record<string, string>) {
    console.log(`[MOCK WhatsApp to ${phone}] Template: ${template}`);
    console.log(`Variables:`, variables);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 200));
    return { success: true, messageId: `wa_${Date.now()}` };
  },

  /**
   * Send an in-app push notification
   */
  async sendPushNotification(userId: string, title: string, body: string) {
    console.log(`[MOCK Push to User ${userId}] ${title} - ${body}`);
    await new Promise(r => setTimeout(r, 150));
    return { success: true, messageId: `push_${Date.now()}` };
  },

  // === Pre-defined Notification Triggers === //

  async notifyDeliveryETA(phone: string, customerName: string, eta: string, riderName: string) {
    return this.sendWhatsApp(phone, 'delivery_eta', {
      name: customerName,
      eta,
      rider: riderName,
    });
  },

  async notifyBundleExpiryWarning(phone: string, customerName: string, daysLeft: number) {
    return this.sendWhatsApp(phone, 'bundle_expiry_warning', {
      name: customerName,
      days: daysLeft.toString(),
    });
  },

  async notifyAutoPaySuccess(phone: string, customerName: string, amount: string, nextDelivery: string) {
    return this.sendWhatsApp(phone, 'autopay_success', {
      name: customerName,
      amount,
      date: nextDelivery,
    });
  }
};
