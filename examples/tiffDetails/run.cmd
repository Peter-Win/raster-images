cd ..
cd ..
call yarn build
cd examples
cd tiffDetails
call node index.js %1
start details.html