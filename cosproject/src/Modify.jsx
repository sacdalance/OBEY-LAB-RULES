import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';

function Modify() {
  const { id } = useParams();
  const [instructor, setInstructor] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8081/instructors/${id}`)
      .then((res) => res.json())
      .then((data) => setInstructor(data))
      .catch((err) => console.error(err));
  }, [id]);

  const handleSave = (e) => {
    e.preventDefault();
    // Add API call for updating instructor
    console.log('Save changes', instructor);
  };

  if (!instructor) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Modify Instructor</h1>
      <form onSubmit={handleSave}>
        <div className="mb-4">
          <label className="block mb-2">First Name</label>
          <input
            type="text"
            value={instructor.instFirstName}
            onChange={(e) => setInstructor({ ...instructor, instFirstName: e.target.value })}
            className="border p-2 w-full"
          />
        </div>
        {/* Add similar fields for other attributes */}
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Save
        </button>
      </form>
    </div>
  );
}

export default Modify;
