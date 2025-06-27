"use client";

import Editor from "@monaco-editor/react";
import React from "react";

const CodeEditor = ({ language, value, onChange }) => {
  return (
    <Editor
      height="calc(100vh - 36px)"
      language={language}
      value={value}
      theme="vs-dark"
      onChange={onChange}
    />
  );
};

export default CodeEditor;

// import React, { useState } from "react";
// import axios from "axios";
// import { useFormik } from "formik";
// // import { basicSchema } from "../schemas";

// const YeniSifre = () => {
//   const [responseMessage, setResponseMessage] = useState("");
//   const token = localStorage.getItem("token");
//   const decodedToken = JSON.parse(atob('ewoibmFtZSI6ICJoZWxsbyIKfQ=='));
//   const kullaniciId = decodedToken.kullaniciId;

//   const updateUserPassword = async (values) => {
//     try {
//       const response = await axios.put(
//         `http://localhost:8080/api/kullanicilar/${kullaniciId}`,
//         { yeniSifre: values.sifre }
//       );
//       setResponseMessage(response.data);
//     } catch (error) {
//       console.error("Bir hata oluştu:", error);
//       setResponseMessage("Şifre güncelleme işlemi başarısız oldu.");
//     }
//   };

//   const formik = useFormik({
//     initialValues: {
//       sifre: ""
//     },
//     // validationSchema: basicSchema,
//     onSubmit: async (values, { resetForm }) => {
//       await updateUserPassword(values);
//       resetForm();
//     }
//   });

//   return (
//     <form onSubmit={formik.handleSubmit}>
//       <div>
//         <label htmlFor="kullaniciId">Kullanıcı ID:</label>
//         <input
//           type="text"
//           id="kullaniciId"
//           value={kullaniciId}
//           disabled
//         />
//       </div>
//       <div>
//         <label htmlFor="sifre">Yeni Şifre:</label>
//         <input
//         name="sifre"
//           type="password"
//           id="sifre"
//           value={formik.values.sifre}
//           onChange={formik.handleChange}
//         />
//         {formik.errors.sifre && <div>{formik.errors.sifre}</div>}
//       </div>
//       <button type="submit" disabled={formik.isSubmitting}>
//         {formik.isSubmitting ? "Güncelleniyor..." : "Şifreyi Güncelle"}
//       </button>
//       <div>{responseMessage}</div>
//     </form>
//   );
// };

// export default YeniSifre;
