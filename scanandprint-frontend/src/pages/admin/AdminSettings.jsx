import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ShieldCheck,
  Loader2,
  Clock,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Megaphone,
} from 'lucide-react'
import { useAdminSettingsQuery, useAdminMutations } from '../../hooks/useAdminQueries'
import AdminSettingsSkeleton from '../../components/skeleton/AdminSettingsSkeleton'

const adminSettingsSchema = z.object({
  monthlyPrice: z.number().min(1, 'Minimum price is ₹1'),
  monthlyOriginalPrice: z.number().min(1, 'Minimum price is ₹1'),
  yearlyPrice: z.number().min(1, 'Minimum price is ₹1'),
  yearlyOriginalPrice: z.number().min(1, 'Minimum price is ₹1'),
  demoDurationHours: z.number().min(1).max(168),
  filePurgeMinutes: z.number().min(10).max(1440),
  supportPhone: z.string().min(5, 'Enter valid phone'),
  supportEmail: z.string().email('Enter valid email'),
  supportAddress: z.string().min(5, 'Enter valid address'),
  systemNotice: z.string().optional().default(''),
  maintenanceMode: z.boolean().default(false),
  demoMode: z.boolean().default(false),
})

export default function AdminSettings() {
  const { data: settingsData, isLoading: settingsLoading } = useAdminSettingsQuery()
  const { updateSettingsMutation } = useAdminMutations()
  const isSavingSettings = updateSettingsMutation.isPending

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminSettingsSchema),
    defaultValues: {
      monthlyPrice: 199,
      monthlyOriginalPrice: 599,
      yearlyPrice: 999,
      yearlyOriginalPrice: 3999,
      demoDurationHours: 48,
      filePurgeMinutes: 60,
      supportPhone: '+91 7073904473',
      supportEmail: 'scanqrandprint@gmail.com',
      supportAddress: 'Tonk Road, Near University Campus, Jaipur, Rajasthan 302015',
      systemNotice: '',
      maintenanceMode: false,
      demoMode: false,
    },
  })

  useEffect(() => {
    if (settingsData && Object.keys(settingsData).length > 0) {
      reset({
        monthlyPrice: Number(settingsData.monthlyPrice) || 299,
        monthlyOriginalPrice: Number(settingsData.monthlyOriginalPrice) || 499,
        yearlyPrice: Number(settingsData.yearlyPrice) || 799,
        yearlyOriginalPrice: Number(settingsData.yearlyOriginalPrice) || 3588,
        demoDurationHours: Number(settingsData.demoDurationHours) || 48,
        filePurgeMinutes: Number(settingsData.filePurgeMinutes) || 60,
        supportPhone: settingsData.supportPhone || '+91 7073904473',
        supportEmail: settingsData.supportEmail || 'scanqrandprint@gmail.com',
        supportAddress: settingsData.supportAddress || 'Tonk Road, Near University Campus, Jaipur, Rajasthan 302015',
        systemNotice: settingsData.systemNotice || '',
        maintenanceMode: Boolean(settingsData.maintenanceMode),
        demoMode: Boolean(settingsData.demoMode),
      })
    }
  }, [settingsData, reset])

  const onSubmit = (formData) => {
    updateSettingsMutation.mutate(formData)
  }

  const watchedMonthlyPrice = watch('monthlyPrice')
  const watchedMonthlyOriginal = watch('monthlyOriginalPrice')
  const watchedYearlyPrice = watch('yearlyPrice')
  const watchedYearlyOriginal = watch('yearlyOriginalPrice')

  const monthlyDiscount =
    watchedMonthlyOriginal > watchedMonthlyPrice
      ? Math.round(((watchedMonthlyOriginal - watchedMonthlyPrice) / watchedMonthlyOriginal) * 100)
      : 0

  const yearlyDiscount =
    watchedYearlyOriginal > watchedYearlyPrice
      ? Math.round(((watchedYearlyOriginal - watchedYearlyPrice) / watchedYearlyOriginal) * 100)
      : 0

  return (
    <div className="flex flex-col gap-6 max-w-4xl">

      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
          Platform Settings & Super Admin Control
        </h1>
        <p className="text-stone-400 text-sm mt-0.5 font-medium">
          Configure platform pricing plans, file auto-purge policies, support details, and broadcast notices
        </p>
      </div>

      {/* Main Settings Form */}
      {settingsLoading ? (
        <AdminSettingsSkeleton />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-stone-950 rounded-3xl p-6 sm:p-8 border border-stone-800 flex flex-col gap-6 shadow-sm">

          {/* 1. Subscription Plan Pricing (Selling & Original MRP Rates) */}
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand" />
              <span>Subscription Plan Pricing &amp; Discounts</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Monthly Plan Group */}
              <div className="p-4 rounded-2xl bg-stone-900/70 border border-stone-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-300">Plan 1 · Monthly</span>
                  {monthlyDiscount > 0 && (
                    <span className="text-[10px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-md">
                      Save {monthlyDiscount}%
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-stone-400">Discount Price (₹ / mo)</label>
                    <input
                      type="number"
                      {...register('monthlyPrice', { valueAsNumber: true })}
                      className="w-full h-10 px-3 rounded-xl border border-stone-700 bg-stone-950 focus:border-brand text-sm font-bold text-white outline-none"
                    />
                    {errors.monthlyPrice && <span className="text-[10px] text-rose-500">{errors.monthlyPrice.message}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-stone-400">Original / MRP (₹)</label>
                    <input
                      type="number"
                      {...register('monthlyOriginalPrice', { valueAsNumber: true })}
                      className="w-full h-10 px-3 rounded-xl border border-stone-700 bg-stone-950 focus:border-brand text-sm font-bold text-stone-300 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Yearly Plan Group */}
              <div className="p-4 rounded-2xl bg-stone-900/70 border border-stone-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-brand font-extrabold">Plan 2 · Yearly (Best Value)</span>
                  {yearlyDiscount > 0 && (
                    <span className="text-[10px] font-extrabold bg-rose-950 text-rose-400 border border-rose-800 px-2 py-0.5 rounded-md">
                      Save {yearlyDiscount}%
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-stone-400">Discount Price (₹ / yr)</label>
                    <input
                      type="number"
                      {...register('yearlyPrice', { valueAsNumber: true })}
                      className="w-full h-10 px-3 rounded-xl border border-stone-700 bg-stone-950 focus:border-brand text-sm font-bold text-brand outline-none"
                    />
                    {errors.yearlyPrice && <span className="text-[10px] text-rose-500">{errors.yearlyPrice.message}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-stone-400">Original / MRP (₹)</label>
                    <input
                      type="number"
                      {...register('yearlyOriginalPrice', { valueAsNumber: true })}
                      className="w-full h-10 px-3 rounded-xl border border-stone-700 bg-stone-950 focus:border-brand text-sm font-bold text-stone-300 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Free Demo & File Purge Policies */}
          <div className="pt-2 border-t border-stone-800/80">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Trial & Privacy Storage Policies</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Free Demo Duration (Hours)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  {...register('demoDurationHours', { valueAsNumber: true })}
                  className="w-full h-11 px-4 rounded-2xl border border-stone-800 bg-stone-900 focus:border-brand text-sm font-bold text-white outline-none"
                />
                <span className="text-[11px] text-stone-500">Default duration granted to newly registered shops</span>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>PDF Auto-Purge Interval (Minutes)</span>
                </label>
                <input
                  type="number"
                  min="10"
                  max="1440"
                  {...register('filePurgeMinutes', { valueAsNumber: true })}
                  className="w-full h-11 px-4 rounded-2xl border border-stone-800 bg-stone-900 focus:border-brand text-sm font-bold text-white outline-none"
                />
                <span className="text-[11px] text-stone-500">Auto-delete customer PDF files after successful print</span>
              </div>
            </div>
          </div>

          {/* 3. Global Support Contact */}
          <div className="pt-2 border-t border-stone-800/80">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Platform Support Info</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>Support WhatsApp / Mobile</span>
                </label>
                <input
                  type="text"
                  {...register('supportPhone')}
                  className="w-full h-11 px-4 rounded-2xl border border-stone-800 bg-stone-900 focus:border-brand text-sm font-bold text-white outline-none"
                />
                {errors.supportPhone && <span className="text-[10px] text-rose-500">{errors.supportPhone.message}</span>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>Support Email</span>
                </label>
                <input
                  type="email"
                  {...register('supportEmail')}
                  className="w-full h-11 px-4 rounded-2xl border border-stone-800 bg-stone-900 focus:border-brand text-sm font-bold text-white outline-none"
                />
                {errors.supportEmail && <span className="text-[10px] text-rose-500">{errors.supportEmail.message}</span>}
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>Platform Office / Support Address</span>
                </label>
                <input
                  type="text"
                  {...register('supportAddress')}
                  placeholder="e.g. Tonk Road, Near University Campus, Jaipur, Rajasthan 302015"
                  className="w-full h-11 px-4 rounded-2xl border border-stone-800 bg-stone-900 focus:border-brand text-sm font-bold text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. Global Broadcast Announcement */}
          <div className="pt-2 border-t border-stone-800/80 flex flex-col gap-2">
            <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-amber-400" />
              <span>Global Broadcast Notice (Shown to all shop owners)</span>
            </label>
            <textarea
              rows="2"
              {...register('systemNotice')}
              placeholder="e.g., Scheduled server maintenance on Sunday at 2:00 AM IST. All print services will resume shortly."
              className="w-full p-3 rounded-2xl border border-stone-800 bg-stone-900 focus:border-brand text-sm font-medium text-white outline-none placeholder:text-stone-600"
            />
          </div>

          {/* 5. Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-800/80">
            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-extrabold text-white">Maintenance Mode</span>
                <span className="text-xs text-stone-400">Pause new kiosks & job creation</span>
              </div>
              <input
                type="checkbox"
                {...register('maintenanceMode')}
                className="w-5 h-5 accent-brand rounded cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-extrabold text-white">Free Demo Mode</span>
                <span className="text-xs text-stone-400">Allow new shops to test free trial</span>
              </div>
              <input
                type="checkbox"
                {...register('demoMode')}
                className="w-5 h-5 accent-brand rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSavingSettings}
            className="btn btn-primary py-3.5 mt-2 w-full flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{isSavingSettings ? 'Saving Settings...' : 'Save Super Admin Settings'}</span>
          </button>

        </form>
      )}

    </div>
  )
}
