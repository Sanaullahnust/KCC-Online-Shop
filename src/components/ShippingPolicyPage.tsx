import { Truck, Clock, ShieldCheck, MapPin, AlertCircle, CheckCircle } from 'lucide-react';

export function ShippingPolicyPage() {
  return (
    <div className="section-padding min-h-screen bg-brand-light/30">
      <div className="container-custom max-w-5xl">
        {/* Header Banner */}
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-black/5 mb-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -z-0 pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              <Truck size={16} /> Fast Nationwide Courier Dispatch
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-black text-brand-dark mb-4">
              Shipping & Delivery Policy
            </h1>
            <p className="text-brand-gray max-w-2xl mx-auto text-sm md:text-base font-medium leading-relaxed">
              Transparent postage rates, weight-based courier charges, and swift dispatch times across all cities in Pakistan.
            </p>
          </div>
        </div>

        {/* Highlight Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-md flex flex-col items-start">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4">
              <Clock size={24} />
            </div>
            <h3 className="font-bold text-lg text-brand-dark mb-2">2-3 Days PK / 10-12 Days Intl</h3>
            <p className="text-xs text-brand-gray leading-relaxed font-medium">
              Estimated delivery: <strong className="text-brand-dark">2-3 business days in Pakistan</strong> and <strong className="text-brand-dark">10-12 working days outside Pakistan internationally selected country</strong>.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-md flex flex-col items-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-lg text-brand-dark mb-2">Advance Transfer Dispatch</h3>
            <p className="text-xs text-brand-gray leading-relaxed font-medium">
              Convenient Bank, EasyPaisa, JazzCash & Raast transfers. Share payment screenshot on WhatsApp for swift dispatch via Leopard, Trax, and TCS couriers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-md flex flex-col items-start">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
              <MapPin size={24} />
            </div>
            <h3 className="font-bold text-lg text-brand-dark mb-2">Self Pickup Option</h3>
            <p className="text-xs text-brand-gray leading-relaxed font-medium">
              Prefer collecting in person? Choose <strong className="text-brand-dark">Self Pickup</strong> at checkout to pay Rs. 0 delivery charge and pick up from our store.
            </p>
          </div>
        </div>

        {/* Detailed Shipping Table & Rules */}
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-black/5 space-y-10">
          <div>
            <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-3 border-b pb-3">
              <span className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-sm font-black">1</span>
              Weight-Based Postage Rates (Pakistan Nationwide)
            </h2>

            <div className="overflow-x-auto my-4">
              <table className="w-full text-left text-xs text-brand-dark border-collapse">
                <thead>
                  <tr className="bg-brand-light border-b border-black/10">
                    <th className="p-3 font-bold uppercase">Parcel Weight Tier</th>
                    <th className="p-3 font-bold uppercase">Courier Postage Rate</th>
                    <th className="p-3 font-bold uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  <tr>
                    <td className="p-3 font-semibold">0g – 500g (Lightweight)</td>
                    <td className="p-3 font-mono font-bold text-brand-primary">Rs. 250</td>
                    <td className="p-3 text-brand-gray">Covers gadgets, compact tools, small accessories</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">501g – 1000g (1 kg Standard)</td>
                    <td className="p-3 font-mono font-bold text-brand-primary">Rs. 400</td>
                    <td className="p-3 text-brand-gray">Covers kitchen tools, multi-packs</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Above 1 kg (Bulk/Wholesale)</td>
                    <td className="p-3 font-mono font-bold text-brand-primary">Rs. 400 + Rs. 150 per extra 500g</td>
                    <td className="p-3 text-brand-gray">Calculated automatically in shopping cart</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-3 border-b pb-3">
              <span className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-sm font-black">2</span>
              Dispatch & Order Verification
            </h2>
            <ul className="space-y-3 text-sm text-brand-gray leading-relaxed font-medium pl-2">
              <li className="flex items-start gap-2">
                <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>All orders are verified via WhatsApp message or quick phone call prior to courier handover.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Tracking numbers are issued as soon as the courier rider scans your package.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
