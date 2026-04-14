import { useEffect, useState } from 'react'
import api from '../services/api'

export const useMaintenanceCheck = () => {
  const [isMaintenance, setIsMaintenance] = useState(false)
  const [maintenanceData, setMaintenanceData] = useState(null)

  useEffect(() => {
    checkMaintenance()
    // Listen for maintenance mode changes
    window.addEventListener('maintenanceToggle', handleMaintenanceToggle)
    return () => {
      window.removeEventListener('maintenanceToggle', handleMaintenanceToggle)
    }
  }, [])

  const handleMaintenanceToggle = (event) => {
    setIsMaintenance(event.detail.isMaintenance)
    setMaintenanceData(event.detail.data)
  }

  const checkMaintenance = async () => {
    try {
      // First try the API endpoint
      const res = await api.get('/site-settings/maintenance-status')
      if (res.data?.is_maintenance) {
        setIsMaintenance(true)
        setMaintenanceData(res.data)
        // Save to localStorage for persistence
        localStorage.setItem('maintenanceMode', JSON.stringify({
          enabled: true,
          data: res.data
        }))
      } else {
        setIsMaintenance(false)
        setMaintenanceData(null)
        localStorage.setItem('maintenanceMode', JSON.stringify({
          enabled: false,
          data: null
        }))
      }
    } catch (e) {
      // If API fails, check localStorage (local-only maintenance mode)
      console.log('⚠️ Maintenance status endpoint unavailable - checking localStorage')
      const localMaintenance = localStorage.getItem('maintenanceMode')
      if (localMaintenance) {
        const parsed = JSON.parse(localMaintenance)
        setIsMaintenance(parsed.enabled)
        setMaintenanceData(parsed.data)
      }
    }
  }

  const toggleMaintenance = (enabled, data = {}) => {
    const maintenanceInfo = {
      enabled,
      data: {
        is_maintenance: enabled,
        reason: data.reason || '',
        endTime: data.endTime || null,
        ...data
      }
    }
    localStorage.setItem('maintenanceMode', JSON.stringify(maintenanceInfo))
    setIsMaintenance(enabled)
    setMaintenanceData(maintenanceInfo.data)
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('maintenanceToggle', {
      detail: {
        isMaintenance: enabled,
        data: maintenanceInfo.data
      }
    }))
  }

  return { isMaintenance, maintenanceData, checkMaintenance, toggleMaintenance }
}

export default useMaintenanceCheck
