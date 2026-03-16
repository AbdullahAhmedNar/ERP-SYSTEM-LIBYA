"use strict";Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const G=require("fs"),S=require("path"),Ne=require("util"),ce=require("electron");function _e(r){return r&&r.__esModule&&Object.prototype.hasOwnProperty.call(r,"default")?r.default:r}var z={exports:{}};function pe(r){throw new Error('Could not dynamically require "'+r+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var O={};O.getBooleanOption=(r,n)=>{let u=!1;if(n in r&&typeof(u=r[n])!="boolean")throw new TypeError(`Expected the "${n}" option to be a boolean`);return u};O.cppdb=Symbol();O.inspect=Symbol.for("nodejs.util.inspect.custom");const K={value:"SqliteError",writable:!0,enumerable:!1,configurable:!0};function I(r,n){if(new.target!==I)return new I(r,n);if(typeof n!="string")throw new TypeError("Expected second argument to be a string");Error.call(this,r),K.value=""+r,Object.defineProperty(this,"message",K),Error.captureStackTrace(this,I),this.code=n}Object.setPrototypeOf(I,Error);Object.setPrototypeOf(I.prototype,Error.prototype);Object.defineProperty(I.prototype,"name",K);var le=I,v={exports:{}},M,J;function he(){if(J)return M;J=1;var r=S.sep||"/";M=n;function n(u){if(typeof u!="string"||u.length<=7||u.substring(0,7)!="file://")throw new TypeError("must pass in a file:// URI to convert to a file path");var T=decodeURI(u.substring(7)),s=T.indexOf("/"),o=T.substring(0,s),i=T.substring(s+1);return o=="localhost"&&(o=""),o&&(o=r+r+o),i=i.replace(/^(.+)\|/,"$1:"),r=="\\"&&(i=i.replace(/\//g,"\\")),/^.+\:/.test(i)||(i=r+i),o+i}return M}var Q;function ge(){return Q||(Q=1,function(r,n){var u=G,T=S,s=he(),o=T.join,i=T.dirname,l=u.accessSync&&function(p){try{u.accessSync(p)}catch{return!1}return!0}||u.existsSync||T.existsSync,y={arrow:process.env.NODE_BINDINGS_ARROW||" → ",compiled:process.env.NODE_BINDINGS_COMPILED_DIR||"compiled",platform:process.platform,arch:process.arch,nodePreGyp:"node-v"+process.versions.modules+"-"+process.platform+"-"+process.arch,version:process.versions.node,bindings:"bindings.node",try:[["module_root","build","bindings"],["module_root","build","Debug","bindings"],["module_root","build","Release","bindings"],["module_root","out","Debug","bindings"],["module_root","Debug","bindings"],["module_root","out","Release","bindings"],["module_root","Release","bindings"],["module_root","build","default","bindings"],["module_root","compiled","version","platform","arch","bindings"],["module_root","addon-build","release","install-root","bindings"],["module_root","addon-build","debug","install-root","bindings"],["module_root","addon-build","default","install-root","bindings"],["module_root","lib","binding","nodePreGyp","bindings"]]};function f(p){typeof p=="string"?p={bindings:p}:p||(p={}),Object.keys(y).map(function(L){L in p||(p[L]=y[L])}),p.module_root||(p.module_root=n.getRoot(n.getFileName())),T.extname(p.bindings)!=".node"&&(p.bindings+=".node");for(var _=typeof __webpack_require__=="function"?__non_webpack_require__:pe,d=[],c=0,a=p.try.length,E,N,m;c<a;c++){E=o.apply(null,p.try[c].map(function(L){return p[L]||L})),d.push(E);try{return N=p.path?_.resolve(E):_(E),p.path||(N.path=E),N}catch(L){if(L.code!=="MODULE_NOT_FOUND"&&L.code!=="QUALIFIED_PATH_RESOLUTION_FAILED"&&!/not find/i.test(L.message))throw L}}throw m=new Error(`Could not locate the bindings file. Tried:
`+d.map(function(L){return p.arrow+L}).join(`
`)),m.tries=d,m}r.exports=n=f,n.getFileName=function(_){var d=Error.prepareStackTrace,c=Error.stackTraceLimit,a={},E;Error.stackTraceLimit=10,Error.prepareStackTrace=function(m,L){for(var g=0,U=L.length;g<U;g++)if(E=L[g].getFileName(),E!==__filename)if(_){if(E!==_)return}else return},Error.captureStackTrace(a),a.stack,Error.prepareStackTrace=d,Error.stackTraceLimit=c;var N="file://";return E.indexOf(N)===0&&(E=s(E)),E},n.getRoot=function(_){for(var d=i(_),c;;){if(d==="."&&(d=process.cwd()),l(o(d,"package.json"))||l(o(d,"node_modules")))return d;if(c===d)throw new Error('Could not find module root given file: "'+_+'". Do you have a `package.json` file? ');c=d,d=o(d,"..")}}}(v,v.exports)),v.exports}var b={},Z;function we(){if(Z)return b;Z=1;const{cppdb:r}=O;return b.prepare=function(u){return this[r].prepare(u,this,!1)},b.exec=function(u){return this[r].exec(u),this},b.close=function(){return this[r].close(),this},b.loadExtension=function(...u){return this[r].loadExtension(...u),this},b.defaultSafeIntegers=function(...u){return this[r].defaultSafeIntegers(...u),this},b.unsafeMode=function(...u){return this[r].unsafeMode(...u),this},b.getters={name:{get:function(){return this[r].name},enumerable:!0},open:{get:function(){return this[r].open},enumerable:!0},inTransaction:{get:function(){return this[r].inTransaction},enumerable:!0},readonly:{get:function(){return this[r].readonly},enumerable:!0},memory:{get:function(){return this[r].memory},enumerable:!0}},b}var x,ee;function Oe(){if(ee)return x;ee=1;const{cppdb:r}=O,n=new WeakMap;x=function(o){if(typeof o!="function")throw new TypeError("Expected first argument to be a function");const i=this[r],l=u(i,this),{apply:y}=Function.prototype,f={default:{value:T(y,o,i,l.default)},deferred:{value:T(y,o,i,l.deferred)},immediate:{value:T(y,o,i,l.immediate)},exclusive:{value:T(y,o,i,l.exclusive)},database:{value:this,enumerable:!0}};return Object.defineProperties(f.default.value,f),Object.defineProperties(f.deferred.value,f),Object.defineProperties(f.immediate.value,f),Object.defineProperties(f.exclusive.value,f),f.default.value};const u=(s,o)=>{let i=n.get(s);if(!i){const l={commit:s.prepare("COMMIT",o,!1),rollback:s.prepare("ROLLBACK",o,!1),savepoint:s.prepare("SAVEPOINT `	_bs3.	`",o,!1),release:s.prepare("RELEASE `	_bs3.	`",o,!1),rollbackTo:s.prepare("ROLLBACK TO `	_bs3.	`",o,!1)};n.set(s,i={default:Object.assign({begin:s.prepare("BEGIN",o,!1)},l),deferred:Object.assign({begin:s.prepare("BEGIN DEFERRED",o,!1)},l),immediate:Object.assign({begin:s.prepare("BEGIN IMMEDIATE",o,!1)},l),exclusive:Object.assign({begin:s.prepare("BEGIN EXCLUSIVE",o,!1)},l)})}return i},T=(s,o,i,{begin:l,commit:y,rollback:f,savepoint:p,release:_,rollbackTo:d})=>function(){let a,E,N;i.inTransaction?(a=p,E=_,N=d):(a=l,E=y,N=f),a.run();try{const m=s.call(o,this,arguments);return E.run(),m}catch(m){throw i.inTransaction&&(N.run(),N!==f&&E.run()),m}};return x}var j,te;function Re(){if(te)return j;te=1;const{getBooleanOption:r,cppdb:n}=O;return j=function(T,s){if(s==null&&(s={}),typeof T!="string")throw new TypeError("Expected first argument to be a string");if(typeof s!="object")throw new TypeError("Expected second argument to be an options object");const o=r(s,"simple"),i=this[n].prepare(`PRAGMA ${T}`,this,!0);return o?i.pluck().get():i.all()},j}var q,re;function be(){if(re)return q;re=1;const r=G,n=S,{promisify:u}=Ne,{cppdb:T}=O,s=u(r.access);q=async function(l,y){if(y==null&&(y={}),typeof l!="string")throw new TypeError("Expected first argument to be a string");if(typeof y!="object")throw new TypeError("Expected second argument to be an options object");l=l.trim();const f="attached"in y?y.attached:"main",p="progress"in y?y.progress:null;if(!l)throw new TypeError("Backup filename cannot be an empty string");if(l===":memory:")throw new TypeError('Invalid backup filename ":memory:"');if(typeof f!="string")throw new TypeError('Expected the "attached" option to be a string');if(!f)throw new TypeError('The "attached" option cannot be an empty string');if(p!=null&&typeof p!="function")throw new TypeError('Expected the "progress" option to be a function');await s(n.dirname(l)).catch(()=>{throw new TypeError("Cannot save backup because the directory does not exist")});const _=await s(l).then(()=>!1,()=>!0);return o(this[T].backup(this,f,l,_),p||null)};const o=(i,l)=>{let y=0,f=!0;return new Promise((p,_)=>{setImmediate(function d(){try{const c=i.transfer(y);if(!c.remainingPages){i.close(),p(c);return}if(f&&(f=!1,y=100),l){const a=l(c);if(a!==void 0)if(typeof a=="number"&&a===a)y=Math.max(0,Math.min(2147483647,Math.round(a)));else throw new TypeError("Expected progress callback to return a number or undefined")}setImmediate(d)}catch(c){i.close(),_(c)}})})};return q}var k,ne;function Ie(){if(ne)return k;ne=1;const{cppdb:r}=O;return k=function(u){if(u==null&&(u={}),typeof u!="object")throw new TypeError("Expected first argument to be an options object");const T="attached"in u?u.attached:"main";if(typeof T!="string")throw new TypeError('Expected the "attached" option to be a string');if(!T)throw new TypeError('The "attached" option cannot be an empty string');return this[r].serialize(T)},k}var B,ae;function Ae(){if(ae)return B;ae=1;const{getBooleanOption:r,cppdb:n}=O;return B=function(T,s,o){if(s==null&&(s={}),typeof s=="function"&&(o=s,s={}),typeof T!="string")throw new TypeError("Expected first argument to be a string");if(typeof o!="function")throw new TypeError("Expected last argument to be a function");if(typeof s!="object")throw new TypeError("Expected second argument to be an options object");if(!T)throw new TypeError("User-defined function name cannot be an empty string");const i="safeIntegers"in s?+r(s,"safeIntegers"):2,l=r(s,"deterministic"),y=r(s,"directOnly"),f=r(s,"varargs");let p=-1;if(!f){if(p=o.length,!Number.isInteger(p)||p<0)throw new TypeError("Expected function.length to be a positive integer");if(p>100)throw new RangeError("User-defined functions cannot have more than 100 arguments")}return this[n].function(o,T,p,i,l,y),this},B}var Y,oe;function Ue(){if(oe)return Y;oe=1;const{getBooleanOption:r,cppdb:n}=O;Y=function(o,i){if(typeof o!="string")throw new TypeError("Expected first argument to be a string");if(typeof i!="object"||i===null)throw new TypeError("Expected second argument to be an options object");if(!o)throw new TypeError("User-defined function name cannot be an empty string");const l="start"in i?i.start:null,y=u(i,"step",!0),f=u(i,"inverse",!1),p=u(i,"result",!1),_="safeIntegers"in i?+r(i,"safeIntegers"):2,d=r(i,"deterministic"),c=r(i,"directOnly"),a=r(i,"varargs");let E=-1;if(!a&&(E=Math.max(T(y),f?T(f):0),E>0&&(E-=1),E>100))throw new RangeError("User-defined functions cannot have more than 100 arguments");return this[n].aggregate(l,y,f,p,o,E,_,d,c),this};const u=(s,o,i)=>{const l=o in s?s[o]:null;if(typeof l=="function")return l;if(l!=null)throw new TypeError(`Expected the "${o}" option to be a function`);if(i)throw new TypeError(`Missing required option "${o}"`);return null},T=({length:s})=>{if(Number.isInteger(s)&&s>=0)return s;throw new TypeError("Expected function.length to be a positive integer")};return Y}var $,se;function Se(){if(se)return $;se=1;const{cppdb:r}=O;$=function(c,a){if(typeof c!="string")throw new TypeError("Expected first argument to be a string");if(!c)throw new TypeError("Virtual table module name cannot be an empty string");let E=!1;if(typeof a=="object"&&a!==null)E=!0,a=_(u(a,"used",c));else{if(typeof a!="function")throw new TypeError("Expected second argument to be a function or a table definition object");a=n(a)}return this[r].table(a,c,E),this};function n(d){return function(a,E,N,...m){const L={module:a,database:E,table:N},g=y.call(d,L,m);if(typeof g!="object"||g===null)throw new TypeError(`Virtual table module "${a}" did not return a table definition object`);return u(g,"returned",a)}}function u(d,c,a){if(!l.call(d,"rows"))throw new TypeError(`Virtual table module "${a}" ${c} a table definition without a "rows" property`);if(!l.call(d,"columns"))throw new TypeError(`Virtual table module "${a}" ${c} a table definition without a "columns" property`);const E=d.rows;if(typeof E!="function"||Object.getPrototypeOf(E)!==f)throw new TypeError(`Virtual table module "${a}" ${c} a table definition with an invalid "rows" property (should be a generator function)`);let N=d.columns;if(!Array.isArray(N)||!(N=[...N]).every(h=>typeof h=="string"))throw new TypeError(`Virtual table module "${a}" ${c} a table definition with an invalid "columns" property (should be an array of strings)`);if(N.length!==new Set(N).size)throw new TypeError(`Virtual table module "${a}" ${c} a table definition with duplicate column names`);if(!N.length)throw new RangeError(`Virtual table module "${a}" ${c} a table definition with zero columns`);let m;if(l.call(d,"parameters")){if(m=d.parameters,!Array.isArray(m)||!(m=[...m]).every(h=>typeof h=="string"))throw new TypeError(`Virtual table module "${a}" ${c} a table definition with an invalid "parameters" property (should be an array of strings)`)}else m=i(E);if(m.length!==new Set(m).size)throw new TypeError(`Virtual table module "${a}" ${c} a table definition with duplicate parameter names`);if(m.length>32)throw new RangeError(`Virtual table module "${a}" ${c} a table definition with more than the maximum number of 32 parameters`);for(const h of m)if(N.includes(h))throw new TypeError(`Virtual table module "${a}" ${c} a table definition with column "${h}" which was ambiguously defined as both a column and parameter`);let L=2;if(l.call(d,"safeIntegers")){const h=d.safeIntegers;if(typeof h!="boolean")throw new TypeError(`Virtual table module "${a}" ${c} a table definition with an invalid "safeIntegers" property (should be a boolean)`);L=+h}let g=!1;if(l.call(d,"directOnly")&&(g=d.directOnly,typeof g!="boolean"))throw new TypeError(`Virtual table module "${a}" ${c} a table definition with an invalid "directOnly" property (should be a boolean)`);return[`CREATE TABLE x(${[...m.map(p).map(h=>`${h} HIDDEN`),...N.map(p)].join(", ")});`,T(E,new Map(N.map((h,F)=>[h,m.length+F])),a),m,L,g]}function T(d,c,a){return function*(...N){const m=N.map(L=>Buffer.isBuffer(L)?Buffer.from(L):L);for(let L=0;L<c.size;++L)m.push(null);for(const L of d(...N))if(Array.isArray(L))s(L,m,c.size,a),yield m;else if(typeof L=="object"&&L!==null)o(L,m,c,a),yield m;else throw new TypeError(`Virtual table module "${a}" yielded something that isn't a valid row object`)}}function s(d,c,a,E){if(d.length!==a)throw new TypeError(`Virtual table module "${E}" yielded a row with an incorrect number of columns`);const N=c.length-a;for(let m=0;m<a;++m)c[m+N]=d[m]}function o(d,c,a,E){let N=0;for(const m of Object.keys(d)){const L=a.get(m);if(L===void 0)throw new TypeError(`Virtual table module "${E}" yielded a row with an undeclared column "${m}"`);c[L]=d[m],N+=1}if(N!==a.size)throw new TypeError(`Virtual table module "${E}" yielded a row with missing columns`)}function i({length:d}){if(!Number.isInteger(d)||d<0)throw new TypeError("Expected function.length to be a positive integer");const c=[];for(let a=0;a<d;++a)c.push(`$${a+1}`);return c}const{hasOwnProperty:l}=Object.prototype,{apply:y}=Function.prototype,f=Object.getPrototypeOf(function*(){}),p=d=>`"${d.replace(/"/g,'""')}"`,_=d=>()=>d;return $}var V,ie;function Fe(){if(ie)return V;ie=1;const r=function(){};return V=function(u,T){return Object.assign(new r,this)},V}const Xe=G,de=S,C=O,De=le;let ue;function w(r,n){if(new.target==null)return new w(r,n);let u;if(Buffer.isBuffer(r)&&(u=r,r=":memory:"),r==null&&(r=""),n==null&&(n={}),typeof r!="string")throw new TypeError("Expected first argument to be a string");if(typeof n!="object")throw new TypeError("Expected second argument to be an options object");if("readOnly"in n)throw new TypeError('Misspelled option "readOnly" should be "readonly"');if("memory"in n)throw new TypeError('Option "memory" was removed in v7.0.0 (use ":memory:" filename instead)');const T=r.trim(),s=T===""||T===":memory:",o=C.getBooleanOption(n,"readonly"),i=C.getBooleanOption(n,"fileMustExist"),l="timeout"in n?n.timeout:5e3,y="verbose"in n?n.verbose:null,f="nativeBinding"in n?n.nativeBinding:null;if(o&&s&&!u)throw new TypeError("In-memory/temporary databases cannot be readonly");if(!Number.isInteger(l)||l<0)throw new TypeError('Expected the "timeout" option to be a positive integer');if(l>2147483647)throw new RangeError('Option "timeout" cannot be greater than 2147483647');if(y!=null&&typeof y!="function")throw new TypeError('Expected the "verbose" option to be a function');if(f!=null&&typeof f!="string"&&typeof f!="object")throw new TypeError('Expected the "nativeBinding" option to be a string or addon object');let p;if(f==null?p=ue||(ue=ge()("better_sqlite3.node")):typeof f=="string"?p=(typeof __non_webpack_require__=="function"?__non_webpack_require__:pe)(de.resolve(f).replace(/(\.node)?$/,".node")):p=f,p.isInitialized||(p.setErrorConstructor(De),p.isInitialized=!0),!s&&!Xe.existsSync(de.dirname(T)))throw new TypeError("Cannot open database because the directory does not exist");Object.defineProperties(this,{[C.cppdb]:{value:new p.Database(T,r,s,o,i,l,y||null,u||null)},...A.getters})}const A=we();w.prototype.prepare=A.prepare;w.prototype.transaction=Oe();w.prototype.pragma=Re();w.prototype.backup=be();w.prototype.serialize=Ie();w.prototype.function=Ae();w.prototype.aggregate=Ue();w.prototype.table=Se();w.prototype.loadExtension=A.loadExtension;w.prototype.exec=A.exec;w.prototype.close=A.close;w.prototype.defaultSafeIntegers=A.defaultSafeIntegers;w.prototype.unsafeMode=A.unsafeMode;w.prototype[C.inspect]=Fe();var ve=w;z.exports=ve;z.exports.SqliteError=le;var Ce=z.exports;const Pe=_e(Ce),Me=`
-- ═══════════════════════════════════════════════════════════════
-- PowerCore ERP - Database Schema v1.0
-- ═══════════════════════════════════════════════════════════════

-- الإعدادات
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  system_name TEXT NOT NULL DEFAULT 'PowerCore ERP',
  username TEXT NOT NULL DEFAULT 'admin',
  password TEXT NOT NULL DEFAULT '123456',
  logo TEXT,
  currency TEXT NOT NULL DEFAULT 'دينار',
  theme TEXT NOT NULL DEFAULT 'light',
  language TEXT NOT NULL DEFAULT 'ar',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- المستخدمون
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- الموردون
CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT,
  address TEXT,
  balance REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- العملاء
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT,
  address TEXT,
  balance REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- المخازن
CREATE TABLE IF NOT EXISTS warehouses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- المنتجات
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'sale',
  sale_price REAL NOT NULL DEFAULT 0,
  cost_price REAL NOT NULL DEFAULT 0,
  rental_price_per_day REAL,
  min_stock INTEGER NOT NULL DEFAULT 0,
  warehouse_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

-- حركات المخزون
CREATE TABLE IF NOT EXISTS stock_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  warehouse_id TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reference_id TEXT,
  reference_type TEXT,
  notes TEXT,
  date TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

-- أوامر الشراء
CREATE TABLE IF NOT EXISTS purchase_orders (
  id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL,
  warehouse_id TEXT NOT NULL,
  total_amount REAL NOT NULL DEFAULT 0,
  paid_amount REAL NOT NULL DEFAULT 0,
  payment_type TEXT NOT NULL DEFAULT 'full',
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  date TEXT NOT NULL,
  items_json TEXT NOT NULL DEFAULT '[]',
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

-- فواتير المبيعات
CREATE TABLE IF NOT EXISTS sale_invoices (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  warehouse_id TEXT NOT NULL,
  total_amount REAL NOT NULL DEFAULT 0,
  paid_amount REAL NOT NULL DEFAULT 0,
  discount REAL NOT NULL DEFAULT 0,
  payment_type TEXT NOT NULL DEFAULT 'immediate',
  profit REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  date TEXT NOT NULL,
  items_json TEXT NOT NULL DEFAULT '[]',
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

-- المولدات
CREATE TABLE IF NOT EXISTS generators (
  id TEXT PRIMARY KEY,
  serial_number TEXT NOT NULL,
  capacity TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- عقود الإيجار
CREATE TABLE IF NOT EXISTS rental_contracts (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  generator_id TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  daily_rate REAL NOT NULL,
  deposit REAL NOT NULL DEFAULT 0,
  advance_payment REAL NOT NULL DEFAULT 0,
  total_days INTEGER NOT NULL DEFAULT 0,
  total_amount REAL NOT NULL DEFAULT 0,
  paid_amount REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (generator_id) REFERENCES generators(id)
);

-- طلبات خدمة ما بعد البيع
CREATE TABLE IF NOT EXISTS after_sales_requests (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  product_id TEXT,
  generator_id TEXT,
  report_date TEXT NOT NULL,
  problem_type TEXT NOT NULL,
  description TEXT NOT NULL,
  maintenance_cost REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'inspection',
  assigned_to TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (generator_id) REFERENCES generators(id)
);

-- الموظفون
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  salary REAL NOT NULL DEFAULT 0,
  start_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  address TEXT,
  national_id TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- صرفيات الرواتب
CREATE TABLE IF NOT EXISTS salary_payments (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  amount REAL NOT NULL,
  month TEXT NOT NULL,
  bonuses REAL NOT NULL DEFAULT 0,
  deductions REAL NOT NULL DEFAULT 0,
  net_salary REAL NOT NULL,
  paid_at TEXT NOT NULL,
  notes TEXT,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- المدفوعات
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  amount REAL NOT NULL,
  reference_id TEXT,
  notes TEXT,
  date TEXT NOT NULL
);

-- المرتجعات
CREATE TABLE IF NOT EXISTS returns (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  supplier_id TEXT,
  customer_id TEXT,
  total_amount REAL NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  date TEXT NOT NULL,
  items_json TEXT NOT NULL DEFAULT '[]'
);

-- الإشعارات
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  link TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- حالة تسجيل الدخول (للمزامنة)
CREATE TABLE IF NOT EXISTS app_session (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_date ON purchase_orders(date);
CREATE INDEX IF NOT EXISTS idx_sale_invoices_date ON sale_invoices(date);
CREATE INDEX IF NOT EXISTS idx_rental_contracts_status ON rental_contracts(status);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(date);
`;let R=null;function W(){if(!R){const r=S.join(ce.app.getPath("userData"),"powercore-erp.db");R=new Pe(r),R.pragma("journal_mode = WAL"),R.pragma("foreign_keys = ON"),R.exec(Me),je()}return R}function xe(){return S.join(ce.app.getPath("userData"),"powercore-erp.db")}function je(){if(R.prepare("SELECT id FROM settings WHERE id = 1").get()||R.prepare(`
      INSERT INTO settings (id, system_name, username, password, currency, theme, language)
      VALUES (1, 'PowerCore ERP', 'admin', '123456', 'دينار', 'light', 'ar')
    `).run(),R.prepare("SELECT COUNT(*) as c FROM warehouses").get().c===0){const u=R.prepare(`
      INSERT INTO warehouses (id, name, location, description, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);u.run("wh-1","المخزن الرئيسي","","المخزن الرئيسي"),u.run("wh-2","مخزن العرض","","مخزن العرض"),u.run("wh-3","مخزن الصيانة","","مخزن الصيانة")}}function qe(){try{const r=W(),n=r.prepare("SELECT * FROM settings WHERE id = 1").get(),u=n?{systemName:n.system_name,username:n.username,password:n.password,logo:n.logo,currency:n.currency,theme:n.theme,language:n.language}:void 0,T=r.prepare("SELECT value FROM app_session WHERE key = 'isLoggedIn'").get(),s=T?T.value==="1":!1,o=e=>(e||[]).map(H=>H?{...H}:null).filter(Boolean),i=o(r.prepare("SELECT * FROM suppliers").all()),l=o(r.prepare("SELECT * FROM customers").all()),y=o(r.prepare("SELECT * FROM users").all()),f=o(r.prepare("SELECT * FROM warehouses").all()),_=r.prepare("SELECT * FROM products").all().map(e=>({id:e.id,code:e.code,name:e.name,type:e.type,salePrice:e.sale_price,costPrice:e.cost_price,rentalPricePerDay:e.rental_price_per_day,minStock:e.min_stock,warehouseId:e.warehouse_id,quantity:e.quantity,createdAt:e.created_at})),c=r.prepare("SELECT * FROM stock_movements").all().map(e=>({id:e.id,productId:e.product_id,warehouseId:e.warehouse_id,type:e.type,quantity:e.quantity,referenceId:e.reference_id,referenceType:e.reference_type,notes:e.notes,date:e.date})),E=r.prepare("SELECT * FROM purchase_orders").all().map(e=>({id:e.id,supplierId:e.supplier_id,warehouseId:e.warehouse_id,items:JSON.parse(e.items_json||"[]"),totalAmount:e.total_amount,paidAmount:e.paid_amount,paymentType:e.payment_type,status:e.status,notes:e.notes,date:e.date})),m=r.prepare("SELECT * FROM sale_invoices").all().map(e=>({id:e.id,customerId:e.customer_id,warehouseId:e.warehouse_id,items:JSON.parse(e.items_json||"[]"),totalAmount:e.total_amount,paidAmount:e.paid_amount,discount:e.discount,paymentType:e.payment_type,profit:e.profit,status:e.status,notes:e.notes,date:e.date})),g=r.prepare("SELECT * FROM generators").all().map(e=>({id:e.id,serialNumber:e.serial_number,capacity:e.capacity,brand:e.brand,model:e.model,status:e.status,notes:e.notes,createdAt:e.created_at})),h=r.prepare("SELECT * FROM rental_contracts").all().map(e=>({id:e.id,customerId:e.customer_id,generatorId:e.generator_id,startDate:e.start_date,endDate:e.end_date,dailyRate:e.daily_rate,deposit:e.deposit,advancePayment:e.advance_payment,totalDays:e.total_days,totalAmount:e.total_amount,paidAmount:e.paid_amount,status:e.status,notes:e.notes,createdAt:e.created_at})),X=r.prepare("SELECT * FROM after_sales_requests").all().map(e=>({id:e.id,customerId:e.customer_id,productId:e.product_id,generatorId:e.generator_id,reportDate:e.report_date,problemType:e.problem_type,description:e.description,maintenanceCost:e.maintenance_cost,status:e.status,assignedTo:e.assigned_to,notes:e.notes,createdAt:e.created_at})),D=r.prepare("SELECT * FROM employees").all().map(e=>({id:e.id,name:e.name,phone:e.phone,email:e.email,position:e.position,department:e.department,salary:e.salary,startDate:e.start_date,status:e.status,address:e.address,nationalId:e.national_id,notes:e.notes,createdAt:e.created_at})),Ee=r.prepare("SELECT * FROM salary_payments").all().map(e=>({id:e.id,employeeId:e.employee_id,amount:e.amount,month:e.month,bonuses:e.bonuses,deductions:e.deductions,netSalary:e.net_salary,paidAt:e.paid_at,notes:e.notes})),Te=r.prepare("SELECT * FROM payments").all().map(e=>({id:e.id,type:e.type,entityId:e.entity_id,amount:e.amount,referenceId:e.reference_id,notes:e.notes,date:e.date})),me=r.prepare("SELECT * FROM returns").all().map(e=>({id:e.id,type:e.type,entityId:e.entity_id,supplierId:e.supplier_id,customerId:e.customer_id,items:JSON.parse(e.items_json||"[]"),totalAmount:e.total_amount,reason:e.reason,date:e.date})),fe=r.prepare("SELECT * FROM notifications").all().map(e=>({id:e.id,type:e.type,title:e.title,message:e.message,isRead:!!e.is_read,link:e.link,createdAt:e.created_at})),Le=i.map(e=>({id:e.id,name:e.name,phone:e.phone||"",email:e.email,address:e.address,balance:e.balance??0,createdAt:e.created_at})),ye=l.map(e=>({id:e.id,name:e.name,phone:e.phone||"",email:e.email,address:e.address,balance:e.balance??0,createdAt:e.created_at}));return{suppliers:Le,customers:ye,users:y.map(e=>({id:e.id,username:e.username,password:e.password})),warehouses:f.map(e=>({id:e.id,name:e.name,location:e.location,description:e.description,createdAt:e.created_at})),products:_,stockMovements:c,purchaseOrders:E,saleInvoices:m,generators:g,rentalContracts:h,afterSalesRequests:X,employees:D,salaryPayments:Ee,payments:Te,returns:me,notifications:fe,settings:u||{systemName:"PowerCore ERP",username:"admin",password:"123456",currency:"دينار",theme:"light",language:"ar"},isLoggedIn:s}}catch(r){return console.error("loadState error:",r),null}}function ke(r){const n=W();n.transaction(()=>{var g,U,h,F,X,P,D;n.prepare("DELETE FROM suppliers").run(),n.prepare("DELETE FROM customers").run(),n.prepare("DELETE FROM users").run(),n.prepare("DELETE FROM warehouses").run(),n.prepare("DELETE FROM products").run(),n.prepare("DELETE FROM stock_movements").run(),n.prepare("DELETE FROM purchase_orders").run(),n.prepare("DELETE FROM sale_invoices").run(),n.prepare("DELETE FROM generators").run(),n.prepare("DELETE FROM rental_contracts").run(),n.prepare("DELETE FROM after_sales_requests").run(),n.prepare("DELETE FROM employees").run(),n.prepare("DELETE FROM salary_payments").run(),n.prepare("DELETE FROM payments").run(),n.prepare("DELETE FROM returns").run(),n.prepare("DELETE FROM notifications").run();const T=n.prepare("INSERT INTO suppliers (id, name, phone, email, address, balance, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)");for(const t of r.suppliers||[])T.run(t.id,t.name,t.phone||"",t.email||null,t.address||null,t.balance??0,t.createdAt);const s=n.prepare("INSERT INTO customers (id, name, phone, email, address, balance, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)");for(const t of r.customers||[])s.run(t.id,t.name,t.phone||"",t.email||null,t.address||null,t.balance??0,t.createdAt);const o=n.prepare('INSERT INTO users (id, username, password, created_at) VALUES (?, ?, ?, datetime("now"))');for(const t of r.users||[])o.run(t.id,t.username,t.password);const i=n.prepare("INSERT INTO warehouses (id, name, location, description, created_at) VALUES (?, ?, ?, ?, ?)");for(const t of r.warehouses||[])i.run(t.id,t.name,t.location||null,t.description||null,t.createdAt);const l=n.prepare("INSERT INTO products (id, code, name, type, sale_price, cost_price, rental_price_per_day, min_stock, warehouse_id, quantity, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");for(const t of r.products||[])l.run(t.id,t.code,t.name,t.type||"sale",t.salePrice??0,t.costPrice??0,t.rentalPricePerDay??null,t.minStock??0,t.warehouseId,t.quantity??0,t.createdAt);const y=n.prepare("INSERT INTO stock_movements (id, product_id, warehouse_id, type, quantity, reference_id, reference_type, notes, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");for(const t of r.stockMovements||[])y.run(t.id,t.productId,t.warehouseId,t.type,t.quantity,t.referenceId||null,t.referenceType||null,t.notes||null,t.date);const f=n.prepare("INSERT INTO purchase_orders (id, supplier_id, warehouse_id, total_amount, paid_amount, payment_type, status, notes, date, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");for(const t of r.purchaseOrders||[])f.run(t.id,t.supplierId,t.warehouseId,t.totalAmount??0,t.paidAmount??0,t.paymentType||"full",t.status||"pending",t.notes||null,t.date,JSON.stringify(t.items||[]));const p=n.prepare("INSERT INTO sale_invoices (id, customer_id, warehouse_id, total_amount, paid_amount, discount, payment_type, profit, status, notes, date, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");for(const t of r.saleInvoices||[])p.run(t.id,t.customerId,t.warehouseId,t.totalAmount??0,t.paidAmount??0,t.discount??0,t.paymentType||"immediate",t.profit??0,t.status||"active",t.notes||null,t.date,JSON.stringify(t.items||[]));const _=n.prepare("INSERT INTO generators (id, serial_number, capacity, brand, model, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");for(const t of r.generators||[])_.run(t.id,t.serialNumber,t.capacity,t.brand||null,t.model||null,t.status||"available",t.notes||null,t.createdAt);const d=n.prepare("INSERT INTO rental_contracts (id, customer_id, generator_id, start_date, end_date, daily_rate, deposit, advance_payment, total_days, total_amount, paid_amount, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");for(const t of r.rentalContracts||[])d.run(t.id,t.customerId,t.generatorId,t.startDate,t.endDate,t.dailyRate??0,t.deposit??0,t.advancePayment??0,t.totalDays??0,t.totalAmount??0,t.paidAmount??0,t.status||"active",t.notes||null,t.createdAt);const c=n.prepare("INSERT INTO after_sales_requests (id, customer_id, product_id, generator_id, report_date, problem_type, description, maintenance_cost, status, assigned_to, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");for(const t of r.afterSalesRequests||[])c.run(t.id,t.customerId,t.productId||null,t.generatorId||null,t.reportDate,t.problemType,t.description,t.maintenanceCost??0,t.status||"inspection",t.assignedTo||null,t.notes||null,t.createdAt);const a=n.prepare("INSERT INTO employees (id, name, phone, email, position, department, salary, start_date, status, address, national_id, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");for(const t of r.employees||[])a.run(t.id,t.name,t.phone||"",t.email||null,t.position,t.department,t.salary??0,t.startDate,t.status||"active",t.address||null,t.nationalId||null,t.notes||null,t.createdAt);const E=n.prepare("INSERT INTO salary_payments (id, employee_id, amount, month, bonuses, deductions, net_salary, paid_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");for(const t of r.salaryPayments||[])E.run(t.id,t.employeeId,t.amount,t.month,t.bonuses??0,t.deductions??0,t.netSalary,t.paidAt,t.notes||null);const N=n.prepare("INSERT INTO payments (id, type, entity_id, amount, reference_id, notes, date) VALUES (?, ?, ?, ?, ?, ?, ?)");for(const t of r.payments||[])N.run(t.id,t.type,t.entityId,t.amount,t.referenceId||null,t.notes||null,t.date);const m=n.prepare("INSERT INTO returns (id, type, entity_id, supplier_id, customer_id, total_amount, reason, date, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");for(const t of r.returns||[])m.run(t.id,t.type,t.entityId,t.supplierId||null,t.customerId||null,t.totalAmount??0,t.reason,t.date,JSON.stringify(t.items||[]));const L=n.prepare("INSERT INTO notifications (id, type, title, message, is_read, link, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)");for(const t of r.notifications||[])L.run(t.id,t.type,t.title,t.message,t.isRead?1:0,t.link||null,t.createdAt);n.prepare(`
      INSERT OR REPLACE INTO settings (id, system_name, username, password, logo, currency, theme, language, updated_at)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(((g=r.settings)==null?void 0:g.systemName)||"PowerCore ERP",((U=r.settings)==null?void 0:U.username)||"admin",((h=r.settings)==null?void 0:h.password)||"123456",((F=r.settings)==null?void 0:F.logo)||null,((X=r.settings)==null?void 0:X.currency)||"دينار",((P=r.settings)==null?void 0:P.theme)||"light",((D=r.settings)==null?void 0:D.language)||"ar"),n.prepare(`
      INSERT OR REPLACE INTO app_session (key, value, updated_at) VALUES ('isLoggedIn', ?, datetime('now'))
    `).run(r.isLoggedIn?"1":"0")})()}exports.getAppDatabase=W;exports.getDatabasePath=xe;exports.loadState=qe;exports.saveState=ke;
