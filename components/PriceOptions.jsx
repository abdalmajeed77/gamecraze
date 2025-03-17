import React, { useState } from 'react';

const PriceOptions = ({ priceOptions, setPriceOptions }) => {
    const [error, setError] = useState('');

    const handleAddOption = () => {
        setPriceOptions([...priceOptions, { price: '', description: '' }]);
    };

    const handleChange = (index, field, value) => {
        const updatedOptions = [...priceOptions];
        updatedOptions[index][field] = value;
        setPriceOptions(updatedOptions);
    };

    const handleRemoveOption = (index) => {
        const updatedOptions = priceOptions.filter((_, i) => i !== index);
        setPriceOptions(updatedOptions);
    };

    const handleMoveOptionUp = (index) => {
        if (index > 0) {
            const updatedOptions = [...priceOptions];
            const temp = updatedOptions[index - 1];
            updatedOptions[index - 1] = updatedOptions[index];
            updatedOptions[index] = temp;
            setPriceOptions(updatedOptions);
        }
    };

    const handleMoveOptionDown = (index) => {
        if (index < priceOptions.length - 1) {
            const updatedOptions = [...priceOptions];
            const temp = updatedOptions[index + 1];
            updatedOptions[index + 1] = updatedOptions[index];
            updatedOptions[index] = temp;
            setPriceOptions(updatedOptions);
        }
    };

    return (
        <div className="price-options-container" style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2 style={{ marginBottom: '15px' }}>Price Options</h2>
            {priceOptions.map((option, index) => (
                <div key={index} className="price-option" style={{ marginBottom: '10px' }}>
                    <input
                        type="number"
                        placeholder="Price"
                        value={option.price}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value < 0) {
                                setError('Price cannot be negative');
                            } else {
                                setError('');
                                handleChange(index, 'price', value);
                            }
                        }}
                    />
                    {error && <span style={{ color: 'red' }}>{error}</span>}
                    <input
                        type="text"
                        placeholder="Description"
                        value={option.description}
                        onChange={(e) => handleChange(index, 'description', e.target.value)}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px', marginLeft: '10px', border: '1px solid #4CAF50', padding: '5px', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                        <button onClick={() => handleMoveOptionUp(index)} disabled={index === 0} style={{ marginRight: '5px', flex: 1 }}>
                            Up
                        </button>
                        <button onClick={() => handleMoveOptionDown(index)} disabled={index === priceOptions.length - 1} style={{ marginRight: '5px', flex: 1 }}>
                            Down
                        </button>
                        <button onClick={() => handleRemoveOption(index)} style={{ color: 'red', flex: 1 }}>X</button>
                    </div>
                </div>
            ))}
            <button onClick={handleAddOption} style={{ color: 'green', marginTop: '10px', padding: '5px 10px', border: 'none', borderRadius: '5px', backgroundColor: '#4CAF50', color: 'white' }}>Add NEW Price</button>
        </div>
    );
};

export default PriceOptions;
