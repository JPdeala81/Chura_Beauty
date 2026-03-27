import { useState, useCallback } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';

export default function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = useCallback(() => {
    onSearch(searchTerm);
  }, [searchTerm, onSearch]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <InputGroup className="mb-4">
      <Form.Control
        placeholder="Rechercher un service..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <Button variant="primary" onClick={handleSearch}>
        🔍 Rechercher
      </Button>
    </InputGroup>
  );
}
