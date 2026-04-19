import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { getRelativeTime, getActivityColors, type Activity } from './activity-helpers'

interface Props {
  loading: boolean
  activities: Activity[]
}

export function RecentActivityWidget({ loading, activities }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Sin actividad reciente</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const colors = getActivityColors(activity.activity_type)
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`flex items-center justify-center w-8 h-8 ${colors.bg} rounded-full flex-shrink-0 mt-1`}>
                    <div className={`w-2 h-2 ${colors.dot} rounded-full`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium truncate">
                      {activity.details || activity.activity_type}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{getRelativeTime(activity.created_at)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
