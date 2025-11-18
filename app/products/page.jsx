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
import { storage } from "../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import dynamic from "next/dynamic";
import Fuse from "fuse.js";
import { Pagination } from "antd";
import Sidebar from "../../components/Sidebar";

const Select = dynamic(() => import("react-select"), { ssr: false });
// ---------- DEBOUNCE FUNCTION
function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer); // cancel previous call
    timer = setTimeout(() => {
      func.apply(this, args); // call function after delay
    }, delay);
  };
}

export default function ProductPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(220);

  useEffect(() => setMounted(true), []);
  const [searchInput, setSearchInput] = useState(""); // immediate input from user
  const [searchQuery, setSearchQuery] = useState(""); // debounced query for search
  // ---------- Debounced search ----------
  const debouncedSetSearchQuery = useMemo(
    () =>
      debounce((value) => {
        setSearchQuery(value); // triggers Fuse.js search
      }, 500), // 500ms delay
    []
  );

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState(null);
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
  const [addingProduct, setAddingProduct] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  const categories = [
    { value: "all", label: "All" },
    { value: "kids", label: "Kids" },
    { value: "men", label: "Men" },
    { value: "women", label: "Women" },
    { value: "perfume", label: "Perfume" },
  ];

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
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
        showPopup("Failed to load products.");
      } finally {
        setLoadingProducts(false);
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
      setAddingProduct(true);

      let finalImageUrl = editProduct.image;

      // If user selected a new file → upload to Firebase Storage
      if (updatedData.imageFile) {
        const imageRef = ref(
          storage,
          `products/${Date.now()}-${updatedData.imageFile.name}`
        );

        await uploadBytes(imageRef, updatedData.imageFile);
        finalImageUrl = await getDownloadURL(imageRef);
      }

      await updateDoc(
        doc(db, "products", "catalog", editProduct.catalog, editProduct.id),
        {
          name: updatedData.name,
          price: updatedData.price,
          catalog: updatedData.catalog,
          image: finalImageUrl,
        }
      );

      setProducts((prev) =>
        prev.map((p) =>
          p.id === editProduct.id
            ? { ...p, ...updatedData, image: finalImageUrl }
            : p
        )
      );

      setEditProduct(null);
      showPopup("Product updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      showPopup("Update failed.");
    } finally {
      setAddingProduct(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!newProduct.name || !newProduct.price || !newProduct.imageFile) {
      alert("All fields required");
      return;
    }

    try {
      setAddingProduct(true);

      // Upload image
      const imageRef = ref(
        storage,
        `products/${Date.now()}-${newProduct.imageFile.name}`
      );

      await uploadBytes(imageRef, newProduct.imageFile);
      const imageUrl = await getDownloadURL(imageRef);

      const docRef = await addDoc(
        collection(db, "products", "catalog", newProduct.catalog),
        {
          name: newProduct.name,
          price: newProduct.price,
          image: imageUrl,
        }
      );

      // PREPEND → NEWEST PRODUCT FIRST
      setProducts((prev) => [
        { id: docRef.id, ...newProduct, image: imageUrl },
        ...prev,
      ]);

      // Go to page 1
      setCurrentPage(1);

      setAddProduct(false);
      setNewProduct({ name: "", price: "", image: "", catalog: "kids" });
      showPopup("Product added successfully!");
    } catch (error) {
      console.error(error);
      showPopup("Add failed");
    } finally {
      setAddingProduct(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-all duration-300">
      <Sidebar />
      <div className="flex-1 p-8 ml-[220px] transition-all duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 mt-6">
          <h1 className="text-3xl font-bold">Products</h1>
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
          <div className="relative flex-1">
            <input
              type="text"
              className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 pr-10"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value); // update input immediately
                debouncedSetSearchQuery(e.target.value); // update searchQuery after 500ms
              }}
            />

            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput(""); // immediately clear input
                  setSearchQuery(""); // immediately clear search results
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-gray-300 dark:bg-gray-600 rounded-full hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200"
              >
                ✕
              </button>
            )}
          </div>
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
          <table className="min-w-full  bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden border-separate border-spacing-y-1">
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
              {loadingProducts ? (
                <tr>
                  <td colSpan={5} className="text-center py-56">
                    <Loader />
                  </td>
                </tr>
              ) : currentProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    No products found.
                  </td>
                </tr>
              ) : (
                currentProducts.map((product) => (
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
                ))
              )}
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
        {mounted && addProduct && (
          <AddProductModal
            categories={categories}
            newProduct={newProduct}
            setNewProduct={setNewProduct}
            onClose={() => setAddProduct(false)}
            handleAddProduct={handleAddProduct}
            loading={addingProduct}
          />
        )}
        {mounted && editProduct && (
          <EditProductModal
            categories={categories}
            editProduct={editProduct}
            updatedData={updatedData}
            setUpdatedData={setUpdatedData}
            onClose={() => setEditProduct(null)}
            handleSaveEdit={handleSaveEdit}
            loading={addingProduct}
          />
        )}
        {mounted && deleteProduct && (
          <DeleteProductModal
            deleteProduct={deleteProduct}
            onClose={() => setDeleteProduct(null)}
            confirmDelete={confirmDelete}
          />
        )}
        {mounted && viewProduct && (
          <ViewProductModal
            viewProduct={viewProduct}
            onClose={() => setViewProduct(null)}
          />
        )}
      </div>
    </div>
  );
}

const Loader = () => (
  <div className="flex justify-center items-center space-x-2">
    <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    <span>Loading...</span>
  </div>
);

/* ---------- Modals ---------- */
const AddProductModal = ({
  categories,
  newProduct,
  setNewProduct,
  onClose,
  handleAddProduct,
  loading,
}) => (
  <Modal title="Add Product" onClose={onClose}>
    <form onSubmit={handleAddProduct} className="space-y-4">
      <Input
        placeholder="Name"
        value={newProduct.name || ""}
        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
      />
      <Input
        type="number"
        placeholder="Price"
        value={newProduct.price || ""}
        onChange={(e) =>
          setNewProduct({ ...newProduct, price: e.target.value })
        }
      />
      {/* Image Upload / Preview Section */}
      <div className="flex flex-col items-center gap-3">
        {/* If NO image → show Upload button */}
        {!newProduct.image && (
          <label className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-md">
            Upload Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;

                const previewURL = URL.createObjectURL(file);

                setNewProduct({
                  ...newProduct,
                  image: previewURL,
                  imageFile: file,
                });
              }}
            />
          </label>
        )}
        {newProduct.image && (
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden border">
              <img
                src={newProduct.image}
                className="w-full h-full object-cover"
                alt="Preview"
              />
            </div>
            <button
              onClick={() =>
                setNewProduct({
                  ...newProduct,
                  image: "",
                  imageFile: null,
                })
              }
              className="absolute top-2 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <Select
        options={categories.filter((c) => c.value !== "all")}
        value={categories.find((c) => c.value === newProduct.catalog)}
        onChange={(selected) =>
          setNewProduct({ ...newProduct, catalog: selected.value })
        }
      />
      <div className="flex justify-end gap-3">
        <Button text="Cancel" color="gray" onClick={onClose} />
        <Button
          text={loading ? "Saving..." : "Save"}
          color="green"
          type="submit"
          disabled={loading}
        />
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
  loading,
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
        type="text"
        placeholder="Price"
        value={
          updatedData.price !== "" ? updatedData.price : editProduct.price || ""
        }
        onChange={(e) =>
          setUpdatedData({ ...updatedData, price: Number(e.target.value) })
        }
      />
      {/* Image Preview + Upload */}
      <div className="flex flex-col items-center gap-3">
        {/* Circle Preview */}
        <div className="w-28 h-28 rounded-full overflow-hidden border">
          <img
            src={updatedData.image || editProduct.image || "/no-image.jpg"}
            className="w-full h-full object-cover"
            alt="preview"
          />
        </div>

        {/* Upload Button */}
        <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md">
          Upload Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;

              const preview = URL.createObjectURL(file);

              setUpdatedData({
                ...updatedData,
                image: preview, // show preview
                imageFile: file, // real file saved for upload
              });
            }}
          />
        </label>
      </div>

      <Select
        options={categories.filter((c) => c.value !== "all")}
        value={categories.find((c) => c.value === updatedData.catalog) || null}
        onChange={(selected) =>
          setUpdatedData({
            ...updatedData,
            catalog: selected ? selected.value : "",
          })
        }
      />
      <div className="flex justify-end gap-3">
        <Button text="Cancel" color="gray" onClick={onClose} />
        <Button
          text={loading ? "Saving..." : "Save"}
          color="blue"
          type="submit"
          disabled={loading}
        />
      </div>
    </form>
  </Modal>
);

const DeleteProductModal = ({ deleteProduct, onClose, confirmDelete }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await confirmDelete(); // call delete function from parent
      onClose(); // close modal after successful deletion
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Confirm Delete" onClose={onClose}>
      <p className="text-center mb-4">
        Are you sure you want to delete <b>{deleteProduct.name}</b>?
      </p>
      <div className="flex justify-center gap-3">
        <Button text="Cancel" color="gray" onClick={onClose} />
        <Button
          text={loading ? "Deleting..." : "Delete"}
          color="red"
          onClick={handleDelete}
          disabled={loading}
        />
      </div>
    </Modal>
  );
};

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
