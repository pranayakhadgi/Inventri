exports.up = async (pgm) => {

    //this enables the vector extension for semantic search
    pgm.createExtension('vector', { ifNotExists: true });

    //add desciption and embedding columns to items
    pgm.addColumns('items', {
        description: { type: 'text' },
        embedding: { type: 'vector(1536)' }
    });

    //the hsnw (Hierarchical Navigable Small World)
    //organizes all the item vectors into a multi-layered, interconnected graph
    //the cosine similarity in the opCLass helps AI to determine how closely
    //related two pieces (e.g. a jbl speaker and a soundcore speaker) are    
    pgm.createIndex('items', 'embedding', {
        name: 'items_embedding_idx',
        method: 'hnsw',
        opclass: 'vector_cosine_ops'
    });
};

exports.down = async (pgm) => {
    pgm.dropIndex('items', 'items_embedding_idx');
    pgm.dropColumns('items', ['description', 'embedding']);
    pgm.dropExtension('vector');
};