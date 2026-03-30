import { useEffect, useState } from 'react'
import api from '../services/api'

export const useMaintenanceCheck = () => {
  const [isMaintenance, setIsMaintenance] = useState(false)
  const [maintenanceData, setMaintenanceData] = useState(null)

  useEffect(() => {
    checkMaintenance()
    const interval = setInterval(checkMaintenance, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  const checkMaintenance = async () => {
    try {
      const res = await api.get('/site-settings/maintenance-status')
      if (res.data?.is_maintenance) {
        setIsMaintenance(true)
        setMaintenanceData(res.data)
      } else {
        setIsMaintenance(false)
        setMaintenanceData(null)
      }
    } catch (e) {
      // Silently fail
    }
  }

  return { isMaintenance, maintenanceData, checkMaintenance }
}

export default useMaintenanceCheck
