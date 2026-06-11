import { platformStats } from '@/pages/home/data'

export function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-teal-800 py-14 sm:py-16">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white" />
        <div className="absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-amber-400" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Trusted by travelers worldwide
          </h2>
          <p className="mt-2 text-sm text-teal-100 sm:text-base">
            Join a growing community exploring Vietnam
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {platformStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/10 px-6 py-8 text-center backdrop-blur-sm"
            >
              <span className="text-3xl" aria-hidden="true">
                {stat.icon}
              </span>
              <p className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-teal-100">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
