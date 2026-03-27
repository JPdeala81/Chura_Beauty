import { useEffect, useState, useContext } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import HeroSection from '../components/public/HeroSection';
import SearchBar from '../components/public/SearchBar';
import CategoryFilter from '../components/public/CategoryFilter';
import ServiceCard from '../components/public/ServiceCard';
import { AuthContext } from '../context/AuthContext';
import * as serviceService from '../services/serviceService';

export default function Home() {
  const { admin } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await serviceService.getAllServices({
          category: selectedCategory,
          search: searchTerm,
        });

        const fetchedServices = response.data.services;
        setServices(fetchedServices);

        const uniqueCategories = [
          ...new Set(fetchedServices.map((s) => s.category)),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedCategory, searchTerm]);

  if (loading && services.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div>
      <HeroSection admin={admin} />

      <Container className="py-5">
        <SearchBar onSearch={setSearchTerm} />
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {services.length === 0 ? (
          <div className="alert alert-info text-center">
            Aucun service trouvé. Essayez une autre recherche.
          </div>
        ) : (
          <Row>
            {services.map((service) => (
              <Col key={service._id} md={6} lg={4} className="mb-4">
                <ServiceCard service={service} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}
