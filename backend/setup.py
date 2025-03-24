from setuptools import setup, find_packages

setup(
    name="backend",
    version="0.1.0",
    py_modules=["main"],
    packages=["db", "models", "routes", "schemas"],
    python_requires=">=3.12",
    install_requires=[
        "fastapi[standard]>=0.115.11",
        "pymysql>=1.1.1",
        "sqlalchemy>=2.0.39",
    ],
) 