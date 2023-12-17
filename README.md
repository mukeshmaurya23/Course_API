![image](https://github.com/mukeshmaurya23/Course_API/assets/77536282/2741222f-88dc-4107-8fee-d4e7fa076618)

Encryption:in this we pass the secert key then with some algorithm it return the cipher text

Decryption :to decrypt the cipher text to plain tetxt it require teh same secret key if key different then result will be different

Hashing :is different in hashing it dont require secret key it just perform some operation and hashed ypur plain text but it cannot be decrypt you just copmare and validate but now cant able to see the original text

JSON WEB TOKEN
jwt jsonwebtoken

console.log(jwt)
![image](https://github.com/mukeshmaurya23/Course_API/assets/77536282/712155a6-6bb2-492c-bba8-5938331275fa)

create secret
eg
const jwt=require('jsonwebtoken')
clg(jwt)
const seceret="1234"
let ans=jwt.sign("text",secret)
clg(ans)
jwt.verify(ans,secret,(err,ogString)=>{

})

![image](https://github.com/mukeshmaurya23/Course_API/assets/77536282/98099b15-c9a4-4a7e-8cb0-0e30ae10f00e)

sign--> to convert the plain text to encrypted text
verify-->to compare is encrypted one is same 
