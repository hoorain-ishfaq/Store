"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, Plus, Home, ShoppingBag } from "lucide-react";
import { auth, db } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Select from "react-select";
import Fuse from "fuse.js";
import { Pagination } from "antd";

export default function AdminPage() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [addProduct, setAddProduct] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    price: "",
    image: "",
    catalog: "kids",
  });
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
    catalog: "kids",
  });
  const [popupMessage, setPopupMessage] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  const categories = [
    { value: "all", label: "All" },
    { value: "kids", label: "Kids" },
    { value: "men", label: "Men" },
    { value: "women", label: "Women" },
    { value: "perfume", label: "Perfume" },
  ];

  // Fetch products from Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const catalogs = ["kids", "men", "women", "perfume"];
        let allProducts = [];
        for (const catalog of catalogs) {
          const q = collection(db, "products", "catalog", catalog);
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((docSnap) => {
            allProducts.push({ id: docSnap.id, ...docSnap.data(), catalog });
          });
        }
        setProducts(allProducts);
        setFilteredProducts(allProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  // Fuse.js for search
  const fuse = useMemo(
    () => new Fuse(products, { keys: ["name"], threshold: 0.3 }),
    [products]
  );

  // Filter & search
  useEffect(() => {
    let result = products;

    if (categoryFilter && categoryFilter.value !== "all") {
      result = result.filter((p) => p.catalog === categoryFilter.value);
    }

    if (searchQuery.trim() !== "") {
      const searchResults = fuse.search(searchQuery);
      result = searchResults.map((r) => r.item);
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [categoryFilter, searchQuery, products, fuse]);

  // Pagination
  const indexOfLast = currentPage * pageSize;
  const indexOfFirst = indexOfLast - pageSize;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);

  const showPopup = (msg) => {
    setPopupMessage(msg);
    setTimeout(() => setPopupMessage(""), 2000);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
      showPopup("Logout failed. Check console.");
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/no-image.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return "/" + imagePath.replace(/^\/+/, "");
  };

  const confirmDelete = async () => {
    if (!deleteProduct) return;
    try {
      await deleteDoc(
        doc(db, "products", "catalog", deleteProduct.catalog, deleteProduct.id)
      );
      setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id));
      setDeleteProduct(null);
      showPopup("Product deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      showPopup("Delete failed.");
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setUpdatedData({
      name: product.name ?? "",
      price: product.price ?? "",
      image: product.image ?? "",
      catalog: product.catalog ?? "kids",
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editProduct) return;
    try {
      await updateDoc(
        doc(db, "products", "catalog", editProduct.catalog, editProduct.id),
        updatedData
      );
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editProduct.id ? { ...p, ...updatedData } : p
        )
      );
      setEditProduct(null);
      showPopup("Product updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      showPopup("Update failed.");
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      alert("Please fill all fields!");
      return;
    }
    try {
      const docRef = await addDoc(
        collection(db, "products", "catalog", newProduct.catalog),
        {
          name: newProduct.name,
          price: newProduct.price,
          image: newProduct.image,
        }
      );
      setProducts((prev) => [...prev, { id: docRef.id, ...newProduct }]);
      setAddProduct(false);
      setNewProduct({ name: "", price: "", image: "", catalog: "kids" });
      showPopup("Product added successfully!");
    } catch (err) {
      console.error("Add product failed:", err);
      showPopup("Add failed.");
    }
  };

  return (
    <div className="flex min-h-screen -mt-3 -mb-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-all duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800  flex flex-col">
        <nav className="flex-1 mt-4">
          <ul className="flex flex-col gap-2">
            <li>
              <a
                className="flex items-center gap-3 p-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                href="#"
              >
                <Home size={18} /> Dashboard
              </a>
            </li>
            <li>
              <a
                className="flex items-center gap-3 p-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                href="#"
              >
                <ShoppingBag size={18} /> Products
              </a>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded w-full justify-center"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8 -mt-6 -mb-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 mt-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setAddProduct(true)}
              className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            >
              <Plus size={18} /> Add Product
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4 mb-6 items-center">
          <input
            type="text"
            placeholder="Search products..."
            className="flex-1 p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="w-64">
            <Select
              options={categories}
              value={categoryFilter}
              onChange={(selected) => setCategoryFilter(selected)}
              placeholder="Filter by category..."
              isClearable
            />
          </div>
        </div>

        {/* Popup */}
        {popupMessage && (
          <div className="fixed top-5 right-5 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            {popupMessage}
          </div>
        )}

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Image</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-3 w-20 h-20 relative">
                    <Image
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      fill
                      className="object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">Rs. {product.price}</td>
                  <td className="px-4 py-3 capitalize">{product.catalog}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteProduct(product)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setViewProduct(product)}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-4">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredProducts.length}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>

        {/* Modals */}
        {addProduct && (
          <AddProductModal
            categories={categories}
            newProduct={newProduct}
            setNewProduct={setNewProduct}
            onClose={() => setAddProduct(false)}
            handleAddProduct={handleAddProduct}
          />
        )}
        {editProduct && (
          <EditProductModal
            categories={categories}
            editProduct={editProduct}
            updatedData={updatedData}
            setUpdatedData={setUpdatedData}
            onClose={() => setEditProduct(null)}
            handleSaveEdit={handleSaveEdit}
          />
        )}
        {deleteProduct && (
          <DeleteProductModal
            deleteProduct={deleteProduct}
            onClose={() => setDeleteProduct(null)}
            confirmDelete={confirmDelete}
          />
        )}
        {viewProduct && (
          <ViewProductModal
            viewProduct={viewProduct}
            onClose={() => setViewProduct(null)}
          />
        )}
      </div>
    </div>
  );
}

/* ---------- Modals ---------- */
const AddProductModal = ({
  categories,
  newProduct,
  setNewProduct,
  onClose,
  handleAddProduct,
}) => (
  <Modal title="Add Product" onClose={onClose}>
    <form onSubmit={handleAddProduct} className="space-y-4">
      <Input
        placeholder="Name"
        value={newProduct.name}
        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
      />
      <Input
        type="number"
        placeholder="Price"
        value={newProduct.price}
        onChange={(e) =>
          setNewProduct({ ...newProduct, price: e.target.value })
        }
      />
      <Input
        placeholder="Image URL"
        value={newProduct.image}
        onChange={(e) =>
          setNewProduct({ ...newProduct, image: e.target.value })
        }
      />
      <Select
        options={categories.filter((c) => c.value !== "all")}
        value={categories.find((c) => c.value === newProduct.catalog)}
        onChange={(selected) =>
          setNewProduct({ ...newProduct, catalog: selected.value })
        }
      />
      <div className="flex justify-end gap-3">
        <Button text="Cancel" color="gray" onClick={onClose} />
        <Button text="Save" color="green" type="submit" />
      </div>
    </form>
  </Modal>
);

const EditProductModal = ({
  categories,
  editProduct,
  updatedData,
  setUpdatedData,
  onClose,
  handleSaveEdit,
}) => (
  <Modal title={`Edit: ${editProduct.name}`} onClose={onClose}>
    <form onSubmit={handleSaveEdit} className="space-y-4">
      <Input
        placeholder="Name"
        value={updatedData.name || editProduct.name || ""}
        onChange={(e) =>
          setUpdatedData({ ...updatedData, name: e.target.value })
        }
      />
      <Input
        type="number"
        placeholder="Price"
        value={updatedData.price || editProduct.price || ""}
        onChange={(e) =>
          setUpdatedData({ ...updatedData, price: e.target.value })
        }
      />
      <Input
        placeholder="Image URL"
        value={updatedData.image || editProduct.image || ""}
        onChange={(e) =>
          setUpdatedData({ ...updatedData, image: e.target.value })
        }
      />
      <Select
        options={categories.filter((c) => c.value !== "all")}
        value={categories.find((c) => c.value === updatedData.catalog)}
        onChange={(selected) =>
          setUpdatedData({ ...updatedData, catalog: selected.value })
        }
      />
      <div className="flex justify-end gap-3">
        <Button text="Cancel" color="gray" onClick={onClose} />
        <Button text="Save" color="blue" type="submit" />
      </div>
    </form>
  </Modal>
);

const DeleteProductModal = ({ deleteProduct, onClose, confirmDelete }) => (
  <Modal title="Confirm Delete" onClose={onClose}>
    <p className="text-center mb-4">
      Are you sure you want to delete <b>{deleteProduct.name}</b>?
    </p>
    <div className="flex justify-center gap-3">
      <Button text="Cancel" color="gray" onClick={onClose} />
      <Button text="Delete" color="red" onClick={confirmDelete} />
    </div>
  </Modal>
);

const ViewProductModal = ({ viewProduct, onClose }) => (
  <Modal title={viewProduct.name} hideCloseButton>
    <div className="relative w-full h-64 mb-4">
      <Image
        src={
          viewProduct.image.startsWith("http")
            ? viewProduct.image
            : "/" + viewProduct.image.replace(/^\/+/, "")
        }
        alt={viewProduct.name}
        fill
        className="object-cover rounded"
      />
    </div>
    <p className="mb-2">
      <strong>Price:</strong> Rs. {viewProduct.price}
    </p>
    <p>
      <strong>Category:</strong> {viewProduct.catalog}
    </p>
    <div className="flex justify-center mt-4">
      <Button text="Close" color="gray" onClick={onClose} />
    </div>
  </Modal>
);

/* ---------- Reusable Components ---------- */
const Modal = ({ title, children, onClose, hideCloseButton = false }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-96 relative">
      <h2 className="text-2xl font-semibold mb-4 text-center">{title}</h2>
      {children}
      {!hideCloseButton && onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      )}
    </div>
  </div>
);

const Input = ({ type = "text", ...props }) => (
  <input
    type={type}
    {...props}
    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
  />
);

const Button = ({ text, color, ...props }) => {
  const colors = {
    gray: "bg-gray-400 hover:bg-gray-500",
    green: "bg-green-600 hover:bg-green-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    red: "bg-red-600 hover:bg-red-700",
  };
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded text-white ${colors[color] || colors.gray}`}
    >
      {text}
    </button>
  );
};
