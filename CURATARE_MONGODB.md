# Instrucțiuni pentru curățarea MongoDB

## Problema
Există date duplicate în MongoDB care încalcă constrângerea de unicitate pentru `numarProcesVerbal` în colecția `plati_amenzi`.

## Soluții

### Soluția 1: Șterge baza de date completă (Recomandat pentru dezvoltare)

Conectează-te la MongoDB și șterge baza de date:

**Opțiunea A: Folosind MongoDB Shell (mongosh)**

```bash
# Conectează-te la MongoDB
mongosh

# Alege baza de date
use eGov-tema1

# Șterge baza de date
db.dropDatabase()
```

**Opțiunea B: Folosind MongoDB Compass**
1. Deschide MongoDB Compass
2. Conectează-te la `mongodb://localhost:27017`
3. Găsește baza de date `eGov-tema1`
4. Click dreapta pe baza de date → "Drop Database"

**Opțiunea C: Folosind mongo shell (vechi)**
```bash
mongo
use eGov-tema1
db.dropDatabase()
```

### Soluția 2: Șterge doar colecția cu probleme

```bash
# În mongosh sau mongo
use eGov-tema1
db.plati_amenzi.drop()
```

### Soluția 3: Șterge documentele duplicate

```bash
# În mongosh sau mongo
use eGov-tema1

# Vezi toate documentele cu numarProcesVerbal: 12345
db.plati_amenzi.find({numarProcesVerbal: 12345})

# Șterge toate documentele duplicate (păstrează unul)
db.plati_amenzi.deleteMany({numarProcesVerbal: 12345})

# Sau șterge tot
db.plati_amenzi.deleteMany({})
```

### Soluția 4: Dezactivează auto-crearea index-urilor (NU recomandat)

Modifică `application.properties`:
```properties
spring.data.mongodb.auto-index-creation=false
```

⚠️ **Atenție**: Această soluție nu rezolvă problema, doar o ascunde!

## După curățare

1. Șterge baza de date sau colecțiile
2. Repornește aplicația Spring Boot
3. Aplicația va recrea colecțiile și index-urile corect

## Verificare

După curățare, verifică că nu mai există duplicate:

```bash
# În mongosh
use eGov-tema1
db.plati_amenzi.find({numarProcesVerbal: 12345}).count()
# Ar trebui să returneze 0 sau 1 (nu mai multe)
```

