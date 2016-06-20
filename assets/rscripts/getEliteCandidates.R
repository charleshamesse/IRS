library("irace")

args <- commandArgs(trailingOnly = TRUE)

irace.file <- "irace.Rdata"
filename <- "bestConfigurations.txt"
if(length(args)>0){
##LOTS of validation to make in general
for(i in 1:length(args)){
  if(args[i] == "--irace.file")
    irace.file <- args[i+1]
  if(args[i] == "--filename")
    filename=args[i+1]
  if(args[i] == "--help"){
    cat("example:\n./script --irace.file irace.Rdata --filename candidates.txt\n",
        "Values shown here are default.\n")
    q()
  
  }
}
}

configurations <- getFinalElites(irace.logFile=irace.file, n=10, drop.internals=TRUE) 
configurations <- data.frame(lapply(configurations, unlist), stringsAsFactors=FALSE)

# Print them
print(configurations)

# or Put them in a file
write.table(x=as.data.frame(configurations), file=filename, row.names=FALSE, quote=FALSE)


