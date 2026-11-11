-- SQL demo — a report query with a window function
WITH ranked AS (
  SELECT
    department,
    employee,
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rnk
  FROM employees
  WHERE salary > 40000
)
SELECT department, employee, salary
FROM ranked
WHERE rnk <= 3
ORDER BY department, salary DESC;