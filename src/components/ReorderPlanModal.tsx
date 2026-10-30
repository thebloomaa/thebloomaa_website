'use client';

import React, { useState, useRef } from 'react';
import { useLivePricing } from '@/lib/useLivePricing';

interface ReorderPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  savedAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  } | null;
  defaultDeliveryTime?: string;
  nextStartDateLabel?: string;
  userAllergies?: string;
}

const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || 'Q030020231@ybl';
const UPI_NAME = process.env.NEXT_PUBLIC_UPI_NAME || 'Thebloomaa';
const UPI_PHONE = process.env.NEXT_PUBLIC_UPI_PHONE || '8863002959';

export default function ReorderPlanModal({
  isOpen,
  onClose,
  onSuccess,
  savedAddress,
  defaultDeliveryTime = '07:00 AM',
  nextStartDateLabel = 'Tomorrow morning',
  userAllergies = '',
}: ReorderPlanModalProps) {
  const pricing = useLivePricing();

  const [deliveryTime, setDeliveryTime] = useState(defaultDeliveryTime);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [allergies, setAllergies] = useState(userAllergies);
  const [paymentMode, setPaymentMode] = useState<'PAY_ON_DELIVERY' | 'QR_SCAN'>('PAY_ON_DELIVERY');

  // Address editing state
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressStreet, setAddressStreet] = useState(savedAddress?.street || '');
  const [addressPincode, setAddressPincode] = useState(savedAddress?.pincode || '');

  // UPI state
  const [utrInput, setUtrInput] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submitting
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(UPI_PHONE);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingReceipt(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setScreenshotUrl(data.url);
      } else {
        setError(data.error || 'Failed to upload payment receipt.');
      }
    } catch {
      setError('Network error while uploading payment screenshot.');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleConfirmReorder = async () => {
    setError(null);

    if (paymentMode === 'QR_SCAN') {
      const cleanUtr = utrInput.trim();
      const hasScreenshot = Boolean(screenshotUrl);
      if (cleanUtr.length < 8 && !hasScreenshot) {
        setError('Please enter your 12-digit UPI UTR reference or upload a payment screenshot.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/subscriptions/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryTime,
          deliveryNote,
          allergies,
          paymentMode,
          utr: utrInput.trim() || undefined,
          screenshotUrl: screenshotUrl || undefined,
          addressOverride: isEditingAddress
            ? {
                street: addressStreet.trim(),
                city: 'Patna',
                state: 'Bihar',
                pincode: addressPincode.trim(),
              }
            : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess(data.message || 'Your 7-day Just Bloom Plan has been successfully re-booked!');
        onClose();
      } else {
        setError(data.error || 'Failed to re-book plan. Please try again.');
      }
    } catch {
      setError('Network error while processing your re-order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#EAE2D2] shadow-2xl p-6 sm:p-7 relative text-[#0D2818]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#EAE2D2]/60 hover:bg-[#EAE2D2] text-[#0D2818] flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D97706]/15 border border-[#D97706]/30 text-[#D97706] text-xs font-black uppercase tracking-wider mb-2">
            <span>🔄</span>
            <span>Quick 1-Tap Re-Order</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0D2818]">
            Re-Book Just Bloom Plan (7 Days)
          </h2>
          <p className="text-xs text-[#5E7A67] mt-1">
            7 fresh living enzyme boxes delivered to your doorstep in Patna.
          </p>
        </div>

        {/* Continuity Highlight Banner */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-950 flex items-center gap-2.5 mb-5">
          <span className="text-base">🌱</span>
          <div>
            <strong>Seamless Routine Continuity:</strong> Next cycle starts{' '}
            <span className="font-bold underline text-emerald-800">{nextStartDateLabel}</span> at {deliveryTime}.
          </div>
        </div>

        {/* Plan Summary Box */}
        <div className="rounded-2xl p-4 bg-white border border-[#EAE2D2] mb-5 space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#FAF7F2]">
            <span className="text-xs font-bold text-[#5E7A67]">Selected Routine:</span>
            <span className="text-xs font-black text-[#0D2818]">Just Bloom 7D Trial</span>
          </div>

          <div className="flex items-center justify-between pb-2.5 border-b border-[#FAF7F2]">
            <span className="text-xs font-bold text-[#5E7A67]">Delivery Time Slot:</span>
            <select
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              className="text-xs font-bold text-[#0D2818] bg-[#FAF7F2] border border-[#EAE2D2] rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="06:00 AM">06:00 AM – 07:00 AM</option>
              <option value="06:30 AM">06:30 AM – 07:30 AM</option>
              <option value="07:00 AM">07:00 AM – 08:00 AM</option>
              <option value="07:30 AM">07:30 AM – 08:30 AM</option>
              <option value="08:00 AM">08:00 AM – 09:00 AM</option>
            </select>
          </div>

          {/* Delivery Address Review */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#5E7A67]">Delivery Address:</span>
              <button
                type="button"
                onClick={() => setIsEditingAddress(!isEditingAddress)}
                className="text-[11px] font-bold text-[#D97706] hover:underline cursor-pointer"
              >
                {isEditingAddress ? 'Keep Saved Address' : 'Edit Address'}
              </button>
            </div>

            {isEditingAddress ? (
              <div className="space-y-2 mt-2 pt-2 border-t border-[#FAF7F2]">
                <input
                  type="text"
                  placeholder="Street / Colony / Landmark"
                  value={addressStreet}
                  onChange={(e) => setAddressStreet(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#EAE2D2] text-xs text-[#0D2818] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Pincode (e.g. 800023)"
                  maxLength={6}
                  value={addressPincode}
                  onChange={(e) => setAddressPincode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#EAE2D2] text-xs text-[#0D2818] focus:outline-none"
                />
              </div>
            ) : (
              <p className="text-xs text-[#0D2818] font-medium bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EAE2D2]">
                📍 {savedAddress?.street ? `${savedAddress.street}, Patna - ${savedAddress.pincode}` : 'Saved address on your profile'}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#EAE2D2]">
            <span className="text-xs font-bold text-[#5E7A67]">Total Plan Amount:</span>
            <div className="text-right">
              <span className="text-lg font-black text-[#D97706] font-mono">₹{pricing.price}</span>
              <span className="text-[10px] text-[#5E7A67] block">Zero delivery charges</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="mb-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#5E7A67] mb-2">
            Select Payment Mode
          </label>
          <div className="grid grid-cols-2 gap-2 bg-[#EAE2D2]/50 p-1.5 rounded-2xl border border-[#EAE2D2]">
            <button
              type="button"
              onClick={() => setPaymentMode('PAY_ON_DELIVERY')}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                paymentMode === 'PAY_ON_DELIVERY'
                  ? 'bg-[#D97706] text-white shadow-md'
                  : 'text-[#5E7A67] hover:text-[#0D2818]'
              }`}
            >
              <span>💵</span>
              <span>Cash on Delivery</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMode('QR_SCAN')}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                paymentMode === 'QR_SCAN'
                  ? 'bg-[#D97706] text-white shadow-md'
                  : 'text-[#5E7A67] hover:text-[#0D2818]'
              }`}
            >
              <span>📱</span>
              <span>UPI / QR Scan</span>
            </button>
          </div>
        </div>

        {/* Mode 1: Cash on Delivery Note */}
        {paymentMode === 'PAY_ON_DELIVERY' && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-950 mb-5 leading-relaxed">
            <strong>💵 Pay on Delivery:</strong> Pay ₹{pricing.price} via Cash or UPI QR scan directly to our delivery executive when your first morning box arrives!
          </div>
        )}

        {/* Mode 2: UPI QR Scan */}
        {paymentMode === 'QR_SCAN' && (
          <div className="space-y-4 mb-5 p-4 rounded-2xl bg-white border border-[#EAE2D2]">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-32 h-44 rounded-xl bg-white p-1.5 border border-[#EAE2D2] shadow-sm flex-shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src="/phonepe-merchant-qr.png"
                  alt="Thebloomaa PhonePe Merchant QR"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-1.5 text-center sm:text-left flex-1">
                <span className="text-xs font-bold text-[#0D2818]">Scan Official PhonePe Merchant QR</span>
                <p className="text-[11px] text-[#5E7A67]">
                  Scan using PhonePe, Google Pay, or Paytm to pay <strong className="text-[#D97706] font-mono">₹{pricing.price}</strong>.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer"
                  >
                    {copiedUpi ? '✓ UPI Copied' : `📋 Copy UPI: ${UPI_ID}`}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[#FAF7F2] border border-[#EAE2D2] text-[#0D2818] transition-all cursor-pointer"
                  >
                    {copiedPhone ? '✓ Mobile Copied' : `📱 ${UPI_PHONE}`}
                  </button>
                </div>
                <div className="text-[10px] text-[#5E7A67] font-medium pt-0.5">
                  Verified Merchant: <strong className="text-[#0D2818]">Thebloomaa</strong>
                </div>
              </div>
            </div>


            {/* UTR Input */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5E7A67] mb-1">
                UPI Reference / UTR Number
              </label>
              <input
                type="text"
                placeholder="Enter 12-digit UPI reference number"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE2D2] text-xs font-mono text-[#0D2818] focus:outline-none"
              />
            </div>

            {/* Receipt Upload */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingReceipt}
                className="w-full py-2 px-3 rounded-xl border border-dashed border-[#D97706] text-xs font-bold text-[#D97706] bg-[#D97706]/5 hover:bg-[#D97706]/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>📎</span>
                <span>{uploadingReceipt ? 'Uploading receipt...' : screenshotUrl ? '✓ Screenshot Attached (Tap to replace)' : 'Attach Payment Screenshot (Optional)'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-700 mb-4 flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleConfirmReorder}
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black text-white bg-[#D97706] hover:bg-[#B45309] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {submitting ? (
              <span>Confirming Renewal...</span>
            ) : (
              <span>Confirm Re-Order (₹{pricing.price}) →</span>
            )}
          </button>

          {/* Quick WhatsApp Renewal Option */}
          <a
            href={`https://wa.me/919117501404?text=${encodeURIComponent(`Hi TheBloomaa! I want to renew my Just Bloom 7-Day Plan (₹${pricing.price}) for ${savedAddress?.street ? savedAddress.street : 'my saved address'}. Please confirm my slot! 🌱`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-2xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
          >
            <span>💬</span>
            <span>Or Renew directly via WhatsApp Concierge</span>
          </a>
        </div>
      </div>
    </div>
  );
}
