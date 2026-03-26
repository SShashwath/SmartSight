import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function FeatureCard({ icon, title, description, path, gradient, badge }) {
  return (
    <Link
      to={path}
      className="group card-hover p-6 flex flex-col gap-4 animate-fade-in relative overflow-hidden"
      aria-label={`${title}: ${description}`}
    >
      {/* Background gradient glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient} rounded-2xl blur-xl`} />

      <div className="relative flex items-start justify-between">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg ${gradient} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        {badge && (
          <span className="badge bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {badge}
          </span>
        )}
      </div>

      <div className="relative flex-1">
        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary-300 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-white/50 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="relative flex items-center gap-2 text-sm font-semibold text-primary-400 group-hover:text-primary-300 transition-colors">
        Open feature
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
      </div>
    </Link>
  )
}
