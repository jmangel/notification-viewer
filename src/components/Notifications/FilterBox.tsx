import React from 'react';
import { InputGroup, Form } from 'react-bootstrap';
import { BsSearch } from 'react-icons/bs';

interface FilterBoxProps {
  filter: string;
  setFilter: (filter: string) => void;
}

const FilterBox: React.FC<FilterBoxProps> = ({ filter, setFilter }) => {
  return (
    <InputGroup className="mb-3">
      <InputGroup.Text>
        <BsSearch />
      </InputGroup.Text>
      <Form.Control
        type="text"
        placeholder="Filter notifications by app, title, or content"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
    </InputGroup>
  );
};

export default FilterBox;
