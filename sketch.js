class Organism{
  constructor(){
    this.x = random(WIDTH * 1/3, WIDTH * 2/3);
    this.y = HEIGHT;
    this.r = 5;
    this.genes = [];
    this.fitness = 0;
    this.index = 0;
  }
  
  create_genes(distance){
    let genes = [];
    for (let j = 0; j < distance; j++) {
       genes.push(p5.Vector.random2D());
    }
    this.genes.push(genes);
    console.log(genes.length);
  }
  
  calc_fitness(target){
    const distance = dist(this.x, this.y, target.x, target.y);
    let normalised = distance / HEIGHT;
    this.fitness = 1 - normalised;
  }
  
  crossover(partner){
    let child = new Organism();
    for(let j = 0;j <= target_index;j++){
      let genes = []
      for (let i = 0; i < GENE_LENGTH[j]; i++) {
        try{
          if (i % 2 ==0) {
            genes.push(this.genes[j][i]);
          } else {
            genes.push(partner.genes[j][i]);
          }
        }catch(error){
          genes.push(p5.Vector.random2D());
        }
        
      }
      child.genes.push(genes);
    }
    for(let j = target_index+1;j < Target_array.length;j++){
      let genes = []
      for (let i = 0; i < GENE_LENGTH[j]; i++) {
        genes.push(p5.Vector.random2D());
      }
      child.genes.push(genes);
    }
    return child;
  }
  
  mutate(rate){
    for (let i = 0; i < GENE_LENGTH; i++) {
      if (random(1) < rate) {
         this.genes[target_index][i] = p5.Vector.random2D();
      }
    }
  }
  
}

WIDTH = 400;
HEIGHT = 400;
GENE_LENGTH = [];
population = [];
organism_num = 30;
move_scale = 10;
matingpool = [];
MUTATION_RATE = 10;
index = 0;
generation = 1;
TR = 10;
Target_array = [];
target_index = 0;
target_range = false;
average_fitness = 0;
temp = 0;
// How dystopian on a scale of 1 to 10
DYSTOPIAN_PERCENTAGE = 1;
achieved = []


function setup() {
  createCanvas(WIDTH, HEIGHT);
  for (let i = 0; i < organism_num; i++){
    population.push(new Organism());
  }
}

function avg_calc(){
  let avg = 0;
  for(let body of population){
    avg += body.fitness;
  }
  return avg/population.length
}

function count_calc(){
  let avg = avg_calc();
  return avg > 0.85;
}

function natural_selection(){
  matingpool = [];
  for (let pop of population){
    let n = floor(pow(pop.fitness, 3) * 100);
    for(let i = 0; i < n; i++){
      matingpool.push(pop);
    }
  }
}

function reproduce(){
  for(let i = 0; i < organism_num;i++){
    let organism_parent1_index = floor(random(1, matingpool.length * (11-DYSTOPIAN_PERCENTAGE)/10));
    let organism_parent2_index = floor(random(1, matingpool.length * (11-DYSTOPIAN_PERCENTAGE)/10));
    let organism_parent1 = matingpool[organism_parent1_index-1];
    let organism_parent2 = matingpool[organism_parent2_index-1];
    let organism_child = organism_parent1.crossover(organism_parent2);
    population[i] = organism_child;
  }
}

function mouseClicked() {
  let distance = 0;
  if(Target_array.length == 0){
    distance = dist(WIDTH*2/3, HEIGHT, mouseX, mouseY);
  }else{
    distance = dist(Target_array[Target_array.length-1].x, Target_array[Target_array.length-1].y, mouseX, mouseY);
  }
  distance = floor(distance);
  Target_array.push(createVector(mouseX, mouseY));
  for (let organism of population){
    organism.create_genes(distance);
  }
  GENE_LENGTH.push(distance);
  achieved.push(false);
  console.log(GENE_LENGTH);
}

function draw() {
  background(0);
  
  if(Target_array.length != 0){
    let t = 1;
    for (let Target of Target_array){
      fill('red');
      stroke('red');
      circle(Target.x, Target.y, 10);
      fill("#fff");
      stroke("#fff");
      text(t, Target.x-3, Target.y-20, Target.x, Target.y);
      t += 1;
    }
    
    if(temp < target_index){
       for (let organism of population){
        fill("#fff");
        stroke("#fff");
        circle(organism.x, organism.y, organism.r);
         try{
           organism.x += move_scale*organism.genes[temp][organism.index].x;
           organism.y += move_scale*organism.genes[temp][organism.index].y;
         }catch (error){
           console.log(organism.genes);
           exit();
         }
        organism.index += 1;
        if (dist(organism.x, organism.y, Target_array[temp].x, Target_array[temp].y) < TR){
          target_range = true;
        }
      }
      if(population[0].index == GENE_LENGTH[temp] || target_range){
        if(target_range){
          GENE_LENGTH[temp] = population[0].index;
        }
        
        for (let organism of population){
          organism.index = 0;
        }
        target_range = false;
        temp += 1;
      }
    }else{
      for (let organism of population){
        fill("#fff");
        stroke("#fff");
        circle(organism.x, organism.y, organism.r);
        try{
          organism.x += move_scale*organism.genes[target_index][organism.index].x;
        }catch(error){
          console.log(organism.index);
          exit();
        }
        
        organism.y += move_scale*organism.genes[target_index][organism.index].y;
        organism.index += 1;
        if (dist(organism.x, organism.y, Target_array[target_index].x, Target_array[target_index].y) < TR){
          target_range = true;
        }
      }
      index += 1;
      if(index == GENE_LENGTH[target_index] || target_range){
        for (let organism of population){
          organism.calc_fitness(Target_array[target_index]);
        }
        if(count_calc()){
          if(target_index < Target_array.length-1){
            target_index += 1;
          }
        }
        average_fitness = avg_calc();
        natural_selection();
        reproduce();
        index = 0;
        generation += 1;
        target_range = false;
        temp = 0;
      }
      
    }

    let gen = "Generation: " + generation;
    text(gen, 10, 40, 100, HEIGHT - 30);
    let gen1 = "Average Fitness: " + average_fitness.toFixed(2);
    text(gen1, 10, 55, 120, HEIGHT - 30);
    let gen3 = "Target: " + (target_index + 1);
    text(gen3, 10, 70, 100, HEIGHT - 30);
    
  }else{
    fill("#fff");
    stroke("#fff");
    let gen = "Press anywhere on the screen";
    text(gen, WIDTH/2 - 1/5 * WIDTH, HEIGHT/2 - 8, WIDTH/2 + 1/5 * WIDTH, HEIGHT/2 + 8);
  }
}