irace.file <- "irace.Rdata" 

args <- commandArgs(trailingOnly = TRUE)

irace.file <- "irace.Rdata"

if(length(args)>0){
  for(i in 1:length(args)){
    if(args[i] == "--irace.file")
      irace.file <- args[i+1]
      filename=args[i+1]
    if(args[i] == "--help"){
      cat("example:\n./script --irace.file irace.Rdata \n",
          "Values shown here are default.\n")
      q()
    }
  }
}

load(irace.file)

iterations <- length(iraceResults$iterationElites)
ncand <- nrow(iraceResults$allConfigurations)
felites <- length(iraceResults$allElites[[length(iraceResults$iterationElites)]])

cat("iterations: ",iterations, "\n")
cat("configurations:", ncand,"\n")
cat("Number of final elites:", felites, "\n")

