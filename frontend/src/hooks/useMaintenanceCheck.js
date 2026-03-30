import { useEffect, useState } from 'react'
import api from '../services/api'

export const useMaintenanceCheck = () => {
  const [isMaintenance, setIsMaintenance] = useState(false)
  const [maintenanceData, setMaintenanceData] = useState(null)

  const checkMaintenance = async () => {
    try {
      const res = await api.get('/site-settings/maintenance-status')
      setIsMaintenance(res.data?.is_maintenance || false)
      setMaintenanceData(res.data)
    } catch (e) {
      setIsMaintenance(false)
    }
  }

  useEffect(() => {
    checkMaintenance()
    const interval = setInterval(checkMaintenance, 60000)
    return () => clearInterval(interval)
  }, [])

  return { isMaintenance, maintenanceData, checkMaintenance }
}
