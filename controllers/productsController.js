const Product = require('../models/product');
const storage = require('../utils/cloud_storage');
const asynForEach = require('../utils/async_foreach');
const {findByCategory}=require('../models/product');

module.exports = {


async findByCategory(req,res,next){
    
    try{
        const id_category = req.params.id_category;//cliente
        const data = await Product.findByCategory(id_category);
        return res.status(201).json(data);

    } catch (error) {
        console.log(`Error: ${error}`);
        return res.status(501).json({
         message:`Error al listar los productos por categoria`,
         success:false,
         error:error
        });
    }
},

async findByCategoryAndProductName(req, res, next) {
    try {
        const id_category = req.params.id_category; // CLIENTE
        const product_name = req.params.product_name; // CLIENTE
        const data = await Product.findByCategoryAndProductName(id_category, product_name);
        return res.status(201).json(data);
    } 
    catch (error) {
        console.log(`Error: ${error}`);
        return res.status(501).json({
            message: `Error al listar los productos por categoria`,
            success: false,
            error: error
        });
    }
},

    async create(req,res,next){
        let product = JSON.parse(req.body.product);
        console.log(`PRODUCTOS ${JSON.stringify(product)}`)
        const files = req.files;

        let insert =0;

        if (files.length ===0) {

            return res.status(501).json({
            message:'Error al registrar el producto no tiene imagen',
            success:false
            });
        }
        else{
            try {
                const data = await Product.create(product);
                product.id= data.id;

                const start = async()=>{
                    await  asynForEach(files,async(file)=>{
                    const pathImage = `image_${Date.now()}`;
                    const url =await storage(file,pathImage);

                    if(url !== undefined && url !==null){
                        if(insert==0){
                            product.image1=url;

                        }else if (insert==1){
                            product.image2=url;

                        }else if(insert ==2){
                            product.image3= url;
                        }
                    }
                    await Product.update(product);
                    insert=insert+1;
                    if(insert == files.length){
                        return res.status(201).json({
                            success:true,
                            message:'El producto se ha registrado correctamente'
                        });
                    }
                    });
                }

start();
                
            } catch (error) {
                console.log(`Error: ${error}`);
                return res.status(501).json({
                 message:`Error al registrar el producto ${error}`,
                 success:false,
                 error:error
                });
                
            }
        }
    }
}