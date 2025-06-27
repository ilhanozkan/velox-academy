import Markdown from "./Markdown/Markdown";

const Instructions = () => {
  return (
    <div style={{ padding: "1rem" }}>
      <Markdown>
        {`# SQL Eğitimi

## SQL Nedir?

SQL (Structured Query Language), veritabanları ile iletişim kurmak için kullanılan bir dildir. SQL, veritabanındaki verileri sorgulamak ve manipüle etmek için kullanılır.

## SQL ile Neler Yapılabilir?

- Veritabanı oluşturma
- Veritabanından veri sorgulama
- Veritabanına veri ekleme
- Veritabanındaki veriyi güncelleme
- Veritabanından veri silme

## SQL SELECT İfadesi

\`SELECT\` ifadesi, bir veritabanından veri seçmek için kullanılır.

\`\`\`sql
SELECT column1, column2, ...
FROM table_name;
\`\`\`


Örnek Veritabanı
Bu eğitimde, aşağıdaki örnek veritabanını kullanacağız:

Customers Tablosu:

CustomerID	CustomerName	ContactName	Country
1	Alfreds Futterkiste	Maria Anders	Germany
2	Ana Trujillo Emparedados y helados	Ana Trujillo	Mexico
3	Antonio Moreno Taquería	Antonio Moreno	Mexico

# Örnek

\`Customers\` tablosundan tüm verileri seçmek için aşağıdaki SQL ifadesini kullanabiliriz.

\`\`\`sql
SELECT * FROM customers;
\`\`\`

# SQL SELECT Deyimi

SELECT deyimi, bir veritabanından veri seçmek için kullanılır.

# Örnek

Customers tablosundan veri döndürür:

\`\`\`sql
SELECT CustomerName, City FROM customers;
\`\`\`

SELECT column1, column2, ...
FROM table_name;

Burada, column1, column2, ... içinden veri seçmek istediğiniz tablonun alan adlarıdır.

table_name, içinden veri seçmek istediğiniz tablonun adını temsil eder.
`}
      </Markdown>
    </div>
  );
};

export default Instructions;
