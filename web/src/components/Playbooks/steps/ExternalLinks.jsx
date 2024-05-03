import { useEffect, useState } from "react";
import styles from "./index.module.css";

function ExternalLinks({ links, setLinks }) {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
  });
  const [currentIndex, setCurrentIndex] = useState(null);

  const validate = () => {
    if (formData.url.trim()) {
      return true;
    }

    return false;
  };

  const resetForm = () => {
    setFormData({
      url: "",
      name: "",
    });
    setCurrentIndex(null);
  };

  const handleEdit = () => {
    const temp = structuredClone(links);
    temp[currentIndex] = {
      url: formData.url.trim(),
      name: formData.name.trim(),
    };
    setLinks(temp);
  };

  const handleAdd = () => {
    setLinks([
      ...(links ?? []),
      {
        url: formData.url.trim(),
        name: formData.name.trim(),
      },
    ]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (currentIndex !== null) {
      handleEdit();
    } else {
      handleAdd();
    }
    resetForm();
  };

  const handleChange = (e) => {
    setFormData((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };

  const handleDelete = (index) => {
    const temp = structuredClone(links);
    temp.splice(index, 1);
    setLinks(temp);
  };

  const selectCurrentLink = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (currentIndex != null) {
      setFormData({
        url: links[currentIndex].url,
        name: links[currentIndex].name,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  return (
    <div>
      <form className="flex justify-start gap-2" onSubmit={handleSubmit}>
        <div className="flex flex-col">
          <label htmlFor="name" className="text-xs">
            <b>Name</b>
          </label>
          <input
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
            name="name"
            id="name"
            type="text"
            placeholder="Enter the name here"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="url" className="text-xs">
            <b>URL</b>
          </label>
          <input
            className={styles.input}
            value={formData.url}
            onChange={handleChange}
            id="url"
            name="url"
            type="url"
            placeholder="Enter the URL here"
          />
        </div>
        <button className={styles.btn}>
          {currentIndex !== null ? "Edit" : "Add"}
        </button>
      </form>

      {links?.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>URL</th>
              <th colSpan={2}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {links?.map((e, i) => (
              <tr key={i}>
                <td>{e.name}</td>
                <td>{e.url}</td>
                <td>
                  <button
                    onClick={() => selectCurrentLink(i)}
                    className={styles.btn}>
                    Edit
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(i)}
                    className={styles.btn}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ExternalLinks;
