import { Form } from 'react-bootstrap';

export default function CategoryFilter({ categories, selectedCategory, onSelect }) {
  return (
    <div className="mb-4">
      <h5>Catégories</h5>
      <div className="d-flex flex-wrap gap-2">
        <Form.Check
          type="radio"
          id="all-categories"
          label="Toutes"
          name="category"
          value=""
          checked={selectedCategory === ''}
          onChange={(e) => onSelect(e.target.value)}
        />

        {categories.map((category) => (
          <Form.Check
            key={category}
            type="radio"
            id={`category-${category}`}
            label={category}
            name="category"
            value={category}
            checked={selectedCategory === category}
            onChange={(e) => onSelect(e.target.value)}
          />
        ))}
      </div>
    </div>
  );
}
