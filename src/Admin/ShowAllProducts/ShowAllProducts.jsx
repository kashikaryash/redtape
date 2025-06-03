import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import baseUrl from "../../baseUrl/baseUrl"; // your base url
import EditProductModal from "../../EditImagesModal/EditProductModel";

const ShowAllProducts = () => {
  const [products, setProducts] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSubCategory, setFilterSubCategory] = useState("");
  const [searchName, setSearchName] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedModelNos, setSelectedModelNos] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const searchTimeout = useRef(null);

  // Fetch all products or filtered products
  const fetchProducts = async (category = "", subCategory = "") => {
    try {
      let url = `${baseUrl}/products/getAllProducts`;
      if (category && subCategory) {
        url = `${baseUrl}/products/catAndSubCat/${category}/${subCategory}`;
      } else if (category) {
        url = `${baseUrl}/products/category/${category}`;
      } else if (subCategory) {
        url = `${baseUrl}/products/subCategory/${subCategory}`;
      }

      const res = await axios.get(url);
      setProducts(res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      alert("Failed to fetch products.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle search with debounce & suggestions
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchName(value);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!value.trim()) {
      setSuggestions([]);
      fetchProducts(filterCategory, filterSubCategory);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        // Fetch product name suggestions
        const res = await axios.get(`${baseUrl}/products/suggestions?query=${encodeURIComponent(value)}`);
        setSuggestions(res.data || []);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    }, 300);
  };

  // Perform search by selected suggestion or searchName
  const handleSearch = async (query) => {
    if (!query?.trim()) {
      fetchProducts(filterCategory, filterSubCategory);
      return;
    }

    try {
      const res = await axios.get(`${baseUrl}/products/search?name=${encodeURIComponent(query)}`);
      setProducts(res.data || []);
      setSuggestions([]);
    } catch (err) {
      console.error("Search error:", err);
      alert("Error searching products.");
    }
  };

  // Filter change handlers
  const handleCategoryFilter = (e) => {
    const category = e.target.value;
    setFilterCategory(category);
    fetchProducts(category, filterSubCategory);
  };

  const handleSubCategoryFilter = (e) => {
    const subCategory = e.target.value;
    setFilterSubCategory(subCategory);
    fetchProducts(filterCategory, subCategory);
  };

  // Checkbox handling for select/deselect
  const handleCheckboxChange = (modelNo) => {
    setSelectedModelNos((prev) =>
      prev.includes(modelNo) ? prev.filter((id) => id !== modelNo) : [...prev, modelNo]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allModelNos = products.map((p) => p.modelNo);
      setSelectedModelNos(allModelNos);
    } else {
      setSelectedModelNos([]);
    }
  };

  // Delete selected products
  const handleDeleteSelected = async () => {
    if (selectedModelNos.length === 0) return;
    if (!window.confirm("Are you sure you want to delete selected products?")) return;

    try {
      await Promise.all(
        selectedModelNos.map((modelNo) => axios.delete(`${baseUrl}/products/model/${modelNo}`))
      );
      alert("Selected products deleted.");
      setSelectedModelNos([]);
      fetchProducts(filterCategory, filterSubCategory);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting selected products.");
    }
  };

  // Open edit modal
  const handleEditProduct = (product) => {
    setEditProduct(product);
  };

  // Close modal
  const closeEditModal = () => {
    setEditProduct(null);
  };

  // Save edited product
  const saveEditedProduct = async (updatedProduct) => {
    try {
      await axios.put(`${baseUrl}/products/model/${updatedProduct.modelNo}`, updatedProduct);
      alert("Product updated successfully!");
      setEditProduct(null);
      fetchProducts(filterCategory, filterSubCategory);
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="fw-bold text-center mb-4">Admin Product Portal</h2>

      {/* Search and Filters */}
      <div className="row mb-4 align-items-end g-3">
        <div className="col-md-4 position-relative">
          <label className="form-label fw-semibold">Search by Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter product name"
            value={searchName}
            onChange={handleSearchChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch(searchName);
            }}
          />
          {/* Autocomplete suggestions */}
          {suggestions.length > 0 && (
            <ul
              className="list-group position-absolute w-100"
              style={{ zIndex: 10, maxHeight: "150px", overflowY: "auto" }}
            >
              {suggestions.map((sugg, idx) => (
                <li
                  key={idx}
                  className="list-group-item list-group-item-action"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSearch(sugg)}
                >
                  {sugg}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="col-md-3">
          <label className="form-label fw-semibold">Category</label>
          <select className="form-select" value={filterCategory} onChange={handleCategoryFilter}>
            <option value="">All Categories</option>
            <option value="MEN">Men</option>
            <option value="WOMEN">Women</option>
            <option value="KIDS">Kids</option>
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label fw-semibold">SubCategory</label>
          <select className="form-select" value={filterSubCategory} onChange={handleSubCategoryFilter}>
            <option value="">All SubCategories</option>
            <option value="BOOTS">Boots</option>
            <option value="CASUAL">Casual</option>
            <option value="FORMALSHOES">Formal Shoes</option>
            <option value="SLIDERS">Sliders</option>
            <option value="SPORTSSHOES">Sports Shoes</option>
          </select>
        </div>

        <div className="col-md-2 d-grid">
          <button className="btn btn-primary" onClick={() => handleSearch(searchName)}>
            Search
          </button>
        </div>
      </div>

      {/* Delete selected */}
      {selectedModelNos.length > 0 && (
        <div className="mb-3">
          <button className="btn btn-danger" onClick={handleDeleteSelected}>
            Delete Selected ({selectedModelNos.length})
          </button>
        </div>
      )}

      {/* Product Table */}
      <table className="table table-striped table-bordered align-middle">
        <thead className="table-dark">
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedModelNos.length === products.length && products.length > 0}
                onChange={handleSelectAll}
              />
            </th>
            <th>Model No</th>
            <th>Name</th>
            <th>Category</th>
            <th>SubCategory</th>
            <th>Price (₹)</th>
            <th>Images</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center">
                No products found.
              </td>
            </tr>
          ) : (
            products.map((prod) => (
              <tr key={prod.modelNo}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedModelNos.includes(prod.modelNo)}
                    onChange={() => handleCheckboxChange(prod.modelNo)}
                  />
                </td>
                <td>{prod.modelNo}</td>
                <td>{prod.name}</td>
                <td>{prod.category}</td>
                <td>{prod.subCategory}</td>
                <td>₹{prod.price}</td>
                <td>
                  <div style={{ display: "flex", gap: "5px" }}>
                    {[1, 2, 3, 4, 5].map((num) =>
                      prod[`img${num}`] ? (
                        <img
                          key={num}
                          src={prod[`img${num}`]}
                          alt={`img${num}`}
                          style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "3px" }}
                        />
                      ) : null
                    )}
                  </div>
                </td>
                <td>
                  <button className="btn btn-sm btn-warning" onClick={() => handleEditProduct(prod)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Edit modal */}
      {editProduct && (
        <EditProductModal
          product={editProduct}
          onClose={closeEditModal}
          onSave={saveEditedProduct}
        />
      )}
    </div>
  );
};

export default ShowAllProducts;