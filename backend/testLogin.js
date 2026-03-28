import axios from 'axios'

const testLogin = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@salon.com',
      password: 'Admin123!'
    })
    
    console.log('✅ CONNEXION RÉUSSIE !')
    console.log('Response:', response.data)
  } catch (error) {
    console.error('❌ ERREUR DE CONNEXION')
    console.error('Status:', error.response?.status)
    console.error('Message:', error.response?.data?.message)
    console.error('Error details:', error.message)
  }
}

testLogin()
